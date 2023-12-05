import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useGlobalContext } from "../../contexts/ContextProvider";
import { Modal } from "../../../helper/modalHelper";
import ModalContentSelector from "../editForm/ModalContentSelector";
import RunButtonComponent from "../RunButtonComponent";
import WithInfoPopup from "../../Popper/InfoPopper";
import WithDropdown from "../../Popper/Dropdown";
import { SSHActionConfig, StepDetails } from "../../contexts/ContextTypes";
import { APIResponse, SSHCLIResponse } from "../../../helper/apiAction";
import { CopyDestSelector } from "./CopyDestSelector";
import RestResponseDetails from "./RestResponseDetails";
import CommandResponseDetails from "./CommandResponseDetails";

type Results = {
   [index: number]: APIResponse | SSHCLIResponse;
};

type PostCheckProps = {
   show: boolean;
   currentRunning: number | null;
   currentStepDetails: StepDetails;
   results: Results | undefined;
   workflowHandler: (index?: number) => any;
};

const PostCheck = (props: PostCheckProps) => {
   const [modal, setModal] = useState<{ modalShow: boolean; modalContentType: string | null; selectedAction: any }>({
      modalShow: false,
      modalContentType: null,
      selectedAction: null,
   });
   const [curExpandRow, setCurExpandRow] = useState<number[]>([]);
   const { context, dispatch } = useGlobalContext();

   const expandDetailHandler = (index: number) => {
      if (!curExpandRow.includes(index)) {
         setCurExpandRow((prev) => [...prev, index]);
      } else {
         setCurExpandRow(curExpandRow.filter((ele) => ele !== index));
      }
   };

   const isPostCheckRunning = (index: number) => {
      return props.currentRunning === index;
   };

   const onDragEnd = (result: DropResult) => {
      if (!result.destination) {
         return;
      }

      if (result.destination.index === result.source.index) {
         return;
      }

      dispatch({
         type: "reorderAction",
         payload: {
            source: result.source.index,
            destination: result.destination.index,
            stepKey: context.currentStep.name!,
            tab: "postCheck",
         },
      });
   };

   useEffect(() => {
      setCurExpandRow([]);
   }, [context.currentStep]);

   // check if it collasped
   if (!props.show) return null;

   let apiList: React.ReactNode;
   if (props.currentStepDetails.postCheck && props.currentStepDetails.postCheck.length > 0) {
      apiList = props.currentStepDetails.postCheck.map((postCheck, index) => {
         let runResultStatus =
            props.results && props.results[index] && !isPostCheckRunning(index) ? (
               props.results[index].success ? (
                  <i className="fad fa-check-circle m-2 text-success" />
               ) : (
                  <WithInfoPopup
                     PopperComponent={
                        <div className="d-flex p-2 text-nowrap text-dark">
                           <small>{props.results[index].failureCause}</small>
                        </div>
                     }
                     placement="right"
                  >
                     <i className="fad fa-exclamation-circle m-2 text-danger" />
                  </WithInfoPopup>
               )
            ) : null;
         return (
            <Draggable
               draggableId={`action-${index}-aaa`}
               index={index}
               key={index}
               isDragDisabled={context.mode === "presentation"}
            >
               {(provided) => (
                  <div className="mt-2" ref={provided.innerRef} {...provided.draggableProps}>
                     {/* API DETAILS */}
                     <div
                        className={`shadow-sm p-3 mb-3 bg-light text-secondary rounded pointer ${
                           isPostCheckRunning(index) ? "border" : ""
                        }`}
                        onClick={() => expandDetailHandler(index)}
                     >
                        <div className="d-flex justify-content-between">
                           <div className="d-flex align-items-center">
                              {context.mode === "edit" && (
                                 <div className="action-grip-handle" {...provided.dragHandleProps}>
                                    <i className="fas fa-grip-horizontal" />
                                 </div>
                              )}
                              <div>
                                 <div
                                    className={`api-method-badge text-light me-3 rounded`}
                                    style={{ backgroundColor: postCheck.apiBadgeColor ? postCheck.apiBadgeColor : "#007cad" }}
                                 >
                                    {postCheck.apiBadge ? postCheck.apiBadge : "NO HEADER"}
                                 </div>
                                 {postCheck.title ? postCheck.title : "NO TITLE"}
                              </div>
                              {/* RESULT ICON */}
                              {runResultStatus}
                           </div>
                           <div className="d-flex align-items-center">
                              <RunButtonComponent
                                 currentRunning={isPostCheckRunning(index)}
                                 workflowHandler={() => props.workflowHandler(index)}
                                 disable={isPostCheckRunning(index)}
                              />
                              {context.mode === "edit" && (
                                 <>
                                    <span
                                       className="action-menu"
                                       onClick={(e) => {
                                          e.stopPropagation();
                                          setModal({
                                             modalShow: true,
                                             modalContentType: "postCheck",
                                             selectedAction: { action: postCheck, actionIndex: index },
                                          });
                                       }}
                                    >
                                       Edit
                                    </span>
                                    <span
                                       className="action-menu"
                                       onClick={(e) => {
                                          e.stopPropagation();
                                          dispatch({
                                             type: "addAction",
                                             payload: {
                                                tab: "postCheck",
                                                actionObject: postCheck,
                                                stepKey: context.currentStep.name!,
                                                index: null,
                                             },
                                          });
                                       }}
                                    >
                                       Duplicate
                                    </span>
                                    <WithDropdown
                                       className="action-menu"
                                       bindToRoot
                                       interactive
                                       DropdownComponent={(close) => (
                                          <CopyDestSelector
                                             source="action"
                                             close={close}
                                             onItemClick={(item) => {
                                                dispatch({
                                                   type: "copyAction",
                                                   payload: {
                                                      from: {
                                                         index: index,
                                                         step: context.currentStep.name!,
                                                         tab: "postCheck",
                                                      },
                                                      to: {
                                                         step: ["preCheck", "actions", "postCheck"].includes(item)
                                                            ? context.currentStep.name!
                                                            : item,
                                                         tab: ["preCheck", "actions", "postCheck"].includes(item)
                                                            ? (item as "preCheck" | "actions" | "postCheck")
                                                            : "postCheck",
                                                      },
                                                   },
                                                });
                                             }}
                                          />
                                       )}
                                    >
                                       Copy
                                    </WithDropdown>
                                    <span
                                       className="action-menu danger"
                                       onClick={(e) => {
                                          e.stopPropagation();
                                          setModal({
                                             modalShow: true,
                                             modalContentType: "actionDeleteConfirm",
                                             selectedAction: { action: postCheck, actionIndex: index, tab: "postCheck" },
                                          });
                                       }}
                                    >
                                       Delete
                                    </span>
                                 </>
                              )}

                              <i className={`ps-3 fas fa-caret-${curExpandRow.includes(index) ? "down" : "right"}`}></i>
                           </div>
                        </div>
                     </div>
                     {postCheck.type === "request" || postCheck.type === "polling" ? (
                        <RestResponseDetails
                           show={curExpandRow.includes(index)}
                           response={props.results && props.results[index] ? (props.results[index] as APIResponse) : null}
                           request={postCheck}
                        />
                     ) : (
                        <CommandResponseDetails
                           show={curExpandRow.includes(index)}
                           response={props.results && props.results[index] ? (props.results[index] as SSHCLIResponse) : null}
                           // @ts-ignore TODO: forcing action type to be SSHActionConfig instead of RestActionConfig that is currently returned
                           request={postCheck as SSHActionConfig}
                        />
                     )}
                  </div>
               )}
            </Draggable>
         );
      });
   } else {
      apiList = <div className="shadow-sm p-3 mb-3 bg-light text-secondary rounded pointer">No API request configured.</div>;
   }

   return (
      <>
         <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable-1" type="PERSON" isDropDisabled={context.mode === "presentation"}>
               {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                     <div className="container">{apiList}</div>
                     {provided.placeholder}
                  </div>
               )}
            </Droppable>
         </DragDropContext>
         <Modal
            show={modal.modalShow}
            onHide={() => setModal({ modalShow: false, modalContentType: null, selectedAction: null })}
            width="70%"
         >
            <ModalContentSelector
               onHide={() => setModal({ modalShow: false, modalContentType: null, selectedAction: null })}
               initValue={modal.selectedAction}
               contentType={modal.modalContentType as string}
            />
         </Modal>
      </>
   );
};

export default PostCheck;

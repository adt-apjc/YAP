import { useState } from "react";
import { Modal } from "../../helper/modalHelper";
import { useGlobalContext } from "../contexts/ContextProvider";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

type StepConfig = { name: string; label: string };

type DeleteConfirmationProps = {
   onHide: () => void;
   selectedStep: StepConfig | null;
};

type CloneStepProps = {
   onHide: () => void;
   selectedStep: StepConfig | null;
};

const CloneStep = (props: CloneStepProps) => {
   const { context, dispatch } = useGlobalContext();
   const [newStepTitle, setNewStepTitle] = useState(props.selectedStep ? `${props.selectedStep.label}_copy` : "");

   const cloneStepHandler = (e: React.FormEvent) => {
      e.preventDefault();

      dispatch({
         type: "addStep",
         payload: {
            name: newStepTitle,
            type: "duplicateStep",
            stepDetails: context.config.mainContent[props.selectedStep!.name],
         },
      });
      props.onHide();
   };

   return (
      <>
         <div className="modal-header">
            <span className="modal-title">Clone Step</span>
            <button type="button" className="btn-close" onClick={props.onHide}></button>
         </div>
         <div className="modal-body">
            <form id="cloneStepFrom" onSubmit={cloneStepHandler}>
               <div className="d-flex align-items-center">
                  <label className="me-4">Title</label>
                  <input
                     required
                     type="text"
                     placeholder="step title"
                     className="form-control form-control-sm"
                     name="name"
                     value={newStepTitle}
                     onChange={(e) => setNewStepTitle(e.target.value)}
                  />
               </div>
            </form>
         </div>
         <div className="modal-footer">
            <button type="button" className="btn btn-sm" onClick={props.onHide}>
               Close
            </button>
            <button type="submit" className="btn btn-primary btn-sm" form="cloneStepFrom">
               Duplicate
            </button>
         </div>
      </>
   );
};

const DeleteConfirmation = (props: DeleteConfirmationProps) => {
   const { dispatch } = useGlobalContext();

   const onDeleteHandler = () => {
      dispatch({ type: "deleteStep", payload: { name: props.selectedStep!.name } });
      props.onHide();
   };

   return (
      <>
         <div className="modal-header">
            <span className="modal-title">Confirm Deletion</span>
            <button type="button" className="btn-close" onClick={props.onHide}></button>
         </div>
         <div className="modal-body">
            Title: <span className="text-danger fw-light font-italic">{props.selectedStep ? props.selectedStep.label : ""}</span>
         </div>
         <div className="modal-footer">
            <button type="button" className="btn btn-sm" onClick={props.onHide}>
               Close
            </button>
            <button type="button" className="btn btn-danger btn-sm" onClick={onDeleteHandler}>
               Delete
            </button>
         </div>
      </>
   );
};

type SideBarState = {
   activeAddStep: boolean;
   input: string;
   modalShow: boolean;
   selectedStep: StepConfig | null;
   modalContentType: string;
};

const SideBar = () => {
   const { context, dispatch } = useGlobalContext();
   const [state, setState] = useState<SideBarState>({
      activeAddStep: false,
      input: "",
      modalShow: false,
      selectedStep: null,
      modalContentType: "",
   });

   const isSomeStepRunning = () => {
      for (let i in context.runningStatus) {
         if (context.runningStatus[i] === "running") return true;
      }
      return false;
   };

   const addNewStageHandler = () => {
      dispatch({
         type: "addStep",
         payload: {
            name: state.input,
            type: "addNewStep",
         },
      });
      setState((prev) => ({ ...prev, activeAddStep: false }));
   };

   const onDragEnd = (result: DropResult) => {
      if (!result.destination) {
         return;
      }

      if (result.destination.index === result.source.index) {
         return;
      }

      dispatch({
         type: "reorderSideBarStep",
         payload: {
            source: result.source.index,
            destination: result.destination.index,
         },
      });
   };

   let siteMenuList: React.ReactNode;
   if (context.config.sidebar.length > 0) {
      siteMenuList = context.config.sidebar.map((element, index) => {
         let statusIcon: React.ReactNode;
         if (!context.runningStatus || !context.runningStatus[element.name]) {
            statusIcon = (
               <div className={`status-icon ${context.currentStep.name === element.name ? "curr-selected" : ""} `}>
                  {`${index + 1}`}
               </div>
            );
         } else if (context.runningStatus[element.name] === "success") {
            statusIcon = (
               <div className={`status-icon success`}>
                  <i className="fas fa-check" />
               </div>
            );
         } else if (context.runningStatus[element.name] === "running") {
            statusIcon = (
               <div className={`status-icon normal`}>
                  <i className={"fas fa-spinner fa-spin"} />
               </div>
            );
         } else if (context.runningStatus[element.name] === "fail") {
            statusIcon = (
               <div className={`status-icon danger`}>
                  <i className="fas fa-times" />
               </div>
            );
         }

         return (
            <Draggable
               draggableId={`${element.label}-${index}`}
               index={index}
               key={index}
               isDragDisabled={context.mode === "presentation"}
            >
               {(provided) => (
                  <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                     <div
                        className={`d-flex mb-3 justify-content-center justify-content-lg-between pointer ${
                           isSomeStepRunning() ? "disabled" : ""
                        }`}
                        style={{ fontSize: "20px" }}
                        onClick={(e) => {
                           e.stopPropagation();
                           dispatch({ type: "setCurrentStep", payload: element });
                        }}
                     >
                        <div className="d-flex">
                           <div>{statusIcon}</div>
                           <span
                              className={`step-label-text d-none d-md-block ${isSomeStepRunning() ? "disabled" : ""} ${
                                 context.currentStep.name === element.name ? "curr-selected " : ""
                              } ${
                                 context.runningStatus &&
                                 (context.runningStatus[element.name] === "success" ||
                                    context.runningStatus[element.name] === "fail")
                                    ? "bold"
                                    : ""
                              }`}
                           >
                              {element.label}
                           </span>
                        </div>

                        {context.mode === "edit" && (
                           <div className="d-flex ">
                              <i
                                 title="duplicate"
                                 className={`step-label-text fal fa-copy fa-sm icon-hover-highlight d-none d-lg-block ${
                                    context.currentStep.name === element.name ? "curr-selected" : ""
                                 } ${isSomeStepRunning() ? "disabled" : ""} `}
                                 onClick={(e) => {
                                    e.stopPropagation();
                                    setState((prev) => ({
                                       ...prev,
                                       selectedStep: element,
                                       modalShow: true,
                                       modalContentType: "cloneStep",
                                    }));
                                 }}
                              />
                              <i
                                 title="delete"
                                 className={`step-label-text fal fa-trash-alt fa-sm ms-2 icon-hover-highlight d-none d-lg-block ${
                                    context.currentStep.name === element.name ? "curr-selected" : ""
                                 } ${isSomeStepRunning() ? "disabled" : ""}
                   `}
                                 onClick={(e) => {
                                    e.stopPropagation();
                                    setState((prev) => ({
                                       ...prev,
                                       modalShow: true,
                                       modalContentType: "deleteStep",
                                       selectedStep: element,
                                    }));
                                 }}
                              />
                           </div>
                        )}
                     </div>
                  </div>
               )}
            </Draggable>
         );
      });
   }

   let modalContent: React.ReactNode;
   if (state.modalContentType === "deleteStep")
      modalContent = (
         <DeleteConfirmation
            onHide={() => setState((prev) => ({ ...prev, modalShow: false }))}
            selectedStep={state.selectedStep}
         />
      );
   else
      modalContent = (
         <CloneStep onHide={() => setState((prev) => ({ ...prev, modalShow: false }))} selectedStep={state.selectedStep} />
      );

   return (
      <>
         <div className="sidenav">
            <DragDropContext onDragEnd={onDragEnd}>
               <Droppable droppableId="sidebarSteps" type="sidebarSteps" isDropDisabled={context.mode === "presentation"}>
                  {(provided) => (
                     <div ref={provided.innerRef} {...provided.droppableProps}>
                        {/* Content list */}
                        <div className="container"> {siteMenuList}</div>

                        {provided.placeholder}
                     </div>
                  )}
               </Droppable>
            </DragDropContext>
            {state.activeAddStep && (
               <div className="d-flex my-3 align-items-center">
                  <input
                     type="text"
                     className="form-control form-control-sm"
                     placeholder="Name"
                     value={state.input}
                     onChange={(e) => setState((prev) => ({ ...prev, input: e.target.value }))}
                  />
                  <span
                     className=" icon-hover-higlight pointer"
                     onClick={(e) => {
                        e.stopPropagation();
                        addNewStageHandler();
                     }}
                  >
                     <i className="far fa-check text-success ms-2" />
                  </span>
               </div>
            )}

            {context.mode === "edit" && (
               <div className="text-center">
                  <i
                     className={`text-primary fad fa-${
                        state.activeAddStep ? "minus" : "plus"
                     }-circle pointer font-lg icon-hover-highlight`}
                     onClick={() => setState((prev) => ({ ...prev, activeAddStep: !state.activeAddStep, input: "" }))}
                  />
               </div>
            )}
         </div>
         <Modal show={state.modalShow} onHide={() => setState((prev) => ({ ...prev, modalShow: false }))}>
            {modalContent}
         </Modal>
      </>
   );
};

export default SideBar;

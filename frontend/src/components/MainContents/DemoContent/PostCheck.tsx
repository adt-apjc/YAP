import { useState, useEffect } from "react";
import ReactJson from "@uiw/react-json-view";
import { useGlobalContext } from "../../contexts/ContextProvider";
import { Modal } from "../../../helper/modalHelper";
import ModalContentSelector from "../editForm/ModalContentSelector";
import RunButtonComponent from "../RunButtonComponent";
import WithInfoPopup from "../../Popper/InfoPopper";
import { getStringFromObject, getVariableDetails, checkStaticVarIfUsed } from "../../contexts/Utility";
import { ActionConfig, StepDetails } from "../../contexts/ContextTypes";
import { APIResponse } from "../../../helper/apiAction";

type PostCheckDetailProps = {
   show: boolean;
   request: ActionConfig;
   response: APIResponse | null;
};

type Results = {
   [index: number]: APIResponse;
};

type PostCheckProps = {
   show: boolean;
   currentRunning: number | null;
   currentStepDetails: StepDetails;
   results: Results | undefined;
   workflowHandler: (index?: number) => any;
};

export const PostCheckDetail = (props: PostCheckDetailProps) => {
   const { context } = useGlobalContext();
   let responseViewer;
   let responseStatus = props.response ? `${props.response.status} ${props.response.statusText}` : "";
   let failureCause = props.response && props.response.failureCause ? props.response.failureCause : "";
   let payloadViewer =
      props.request && props.request.data ? (
         <div className="p-2">
            payload
            {props.request.configurePayload?.displayRequestAs === "text" ? (
               <div>{typeof props.request.data === "string" ? props.request.data : JSON.stringify(props.request.data)}</div>
            ) : (
               <ReactJson value={props.request.data} collapsed={4} />
            )}
         </div>
      ) : (
         ""
      );

   if (props.request && props.request.configurePayload?.displayResponseAs === "text") {
      responseViewer = props.response ? (
         <pre className="p-2">{getStringFromObject(props.response.data, props.request.objectPath)}</pre>
      ) : (
         ""
      );
   } else {
      // default display response as JSON
      responseViewer = props.response ? (
         <ReactJson value={typeof props.response.data === "object" ? props.response.data : {}} collapsed={4} />
      ) : (
         ""
      );
   }

   const getHeaderColor = (method: string) => {
      let mapper = { get: "primary", post: "success", put: "info", patch: "warning", delete: "danger" };
      if (method in mapper) return mapper[method as keyof typeof mapper];
      else return "primary";
   };

   const renderVariableDetails = () => {
      const variableDetails = getVariableDetails(props.request);

      return (
         <>
            {variableDetails.length > 0 && (
               <WithInfoPopup
                  PopperComponent={
                     <div className="d-flex flex-column p-2 text-dark" style={{ maxWidth: "800px" }}>
                        {context.config.staticVariables && Object.keys(context.config.staticVariables).length > 0 && (
                           <>
                              {checkStaticVarIfUsed(variableDetails, context.config.staticVariables) && (
                                 <>
                                    <div className="mb-2">
                                       <small className="badge rounded-pill  text-bg-light">Static Variables</small>
                                    </div>
                                    {Object.keys(context.config.staticVariables).map((item, i) => {
                                       if (variableDetails.find((el) => el.key === item))
                                          return (
                                             <div className="d-flex" key={i}>
                                                <small className="me-3" style={{ minWidth: "90px" }}>
                                                   {item}:
                                                </small>
                                                <small>{context.config.staticVariables[item]}</small>
                                             </div>
                                          );
                                       return null;
                                    })}
                                    <hr className="my-2" />
                                 </>
                              )}
                           </>
                        )}

                        {variableDetails.map((item, i) => {
                           if (!Object.keys(context.config.staticVariables).includes(item.key))
                              return (
                                 <div className="d-flex" key={i}>
                                    <small className="me-3" style={{ minWidth: "90px" }}>
                                       {item.key}:
                                    </small>
                                    <small>{item.val}</small>
                                 </div>
                              );
                           return null;
                        })}
                     </div>
                  }
                  placement="left"
               >
                  <div className="badge text-bg-secondary">Variables</div>
               </WithInfoPopup>
            )}
         </>
      );
   };

   if (!props.show) return null;
   return (
      <div className="container position-relative bg-light pt-2 pb-3" style={{ top: "-15px" }}>
         <div className="p-2">{props.request ? props.request.description : ""}</div>
         <div className="d-flex justify-content-between p-2 mb-2">
            <div>
               Endpoint{" "}
               {props.request.useEndpoint ? (
                  <WithInfoPopup
                     PopperComponent={
                        <div className="d-flex p-2 text-dark" style={{ maxWidth: "800px" }}>
                           <small>{`${
                              context.config.endpoints[props.request.useEndpoint] &&
                              context.config.endpoints[props.request.useEndpoint].baseURL
                                 ? context.config.endpoints[props.request.useEndpoint].baseURL
                                 : "baseURL not configured"
                           }`}</small>
                        </div>
                     }
                     placement="right"
                  >
                     <span className="font-weight-light bg-secondary text-light p-1 ms-4 rounded">
                        {props.request.useEndpoint}
                     </span>
                  </WithInfoPopup>
               ) : (
                  <span className="font-weight-light bg-secondary text-light p-1 ms-4 rounded">Not Configured</span>
               )}
            </div>
            <div className="d-flex justify-content-between">
               {/* Polling */}
               <div className="me-2">
                  {props.request.type === "polling" && (
                     <WithInfoPopup
                        PopperComponent={
                           <div className="d-flex flex-column p-2  text-dark" style={{ maxWidth: "800px" }}>
                              <div className="d-flex">
                                 <small className="me-3" style={{ minWidth: "100px" }}>
                                    Max Retry:{" "}
                                 </small>
                                 <small>{props.request.maxRetry}</small>
                              </div>
                              <div className="d-flex">
                                 <small className="me-3" style={{ minWidth: "100px" }}>
                                    Interval:{" "}
                                 </small>
                                 <small>{props.request.interval}</small>
                              </div>
                           </div>
                        }
                        placement="left"
                     >
                        <div className="badge text-bg-secondary">Polling</div>
                     </WithInfoPopup>
                  )}
               </div>
               {/* Variable */}
               <div className="me-2">{renderVariableDetails()}</div>
               {/* Expect */}
               <div>
                  {props.request.expect && props.request.expect.length > 0 && (
                     <WithInfoPopup
                        PopperComponent={
                           <div className="d-flex flex-column p-2 text-dark" style={{ maxWidth: "800px" }}>
                              {props.request.expect.map((item, i) => {
                                 let type = item.type;
                                 if (item.type === "codeIs") type = "responseCodeIs";

                                 return (
                                    <div className="d-flex" key={i}>
                                       <small className="me-3" style={{ minWidth: "100px" }}>
                                          {type}:{" "}
                                       </small>
                                       <small>{`${item.type === "codeIs" ? `${item.value.join(", ")}` : `${item.value}`}`}</small>
                                    </div>
                                 );
                              })}
                           </div>
                        }
                        placement="left"
                     >
                        <div className="badge text-bg-secondary">Expect</div>
                     </WithInfoPopup>
                  )}
               </div>
            </div>
         </div>
         <div className="bg-white p-2 rounded shadow-sm mb-2">
            <div className="d-flex">
               <div className={`me-3 font-weight-bolder text-${getHeaderColor(props.request.method)}`}>
                  {props.request.method.toUpperCase()}
               </div>
               <div className="text-dark">{props.request.url}</div>
            </div>
            {payloadViewer}
         </div>
         <div className="bg-white p-2 rounded shadow-sm">
            <div className="d-flex justify-content-between">
               Response
               <div className="font-weight-light" style={{ fontSize: "12px" }}>
                  {responseStatus} {failureCause && `- ${failureCause}`}
               </div>
            </div>
            {responseViewer}
         </div>
      </div>
   );
};

const PostCheck = (props: PostCheckProps) => {
   const { context } = useGlobalContext();
   const [modal, setModal] = useState<{ modalShow: boolean; modalContentType: string | null; selectedAction: any }>({
      modalShow: false,
      modalContentType: null,
      selectedAction: null,
   });
   const [curExpandRow, setCurExpandRow] = useState<number[]>([]);

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

   useEffect(() => {
      setCurExpandRow([]);
   }, [context.currentStep]);

   // check if it collasped
   if (!props.show) return null;

   let apiList;
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
            <div className="mt-2" key={index}>
               {/* API DETAILS */}
               <div
                  className={`shadow-sm p-3 mb-3 bg-light text-secondary rounded pointer ${
                     isPostCheckRunning(index) ? "border" : ""
                  }`}
                  onClick={() => expandDetailHandler(index)}
               >
                  <div className="d-flex justify-content-between">
                     <div className="d-flex align-items-center">
                        {/* API METHOD , TITLE , DESC */}
                        <div>
                           <div
                              className={`api-method-badge text-light me-3 rounded`}
                              style={{ backgroundColor: postCheck.headerColor ? postCheck.headerColor : "#007cad" }}
                           >
                              {postCheck.header ? postCheck.header : "NO HEADER"}
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
                                 className="px-1 font-sm font-weight-light text-info text-hover-highlight"
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
                                 className="px-1 font-sm font-weight-light text-danger text-hover-highlight"
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

                        <i className={`fas fa-caret-${curExpandRow.includes(index) ? "down" : "right"}`}></i>
                     </div>
                  </div>
               </div>

               {/* API RESPONSE DETAILS*/}
               <PostCheckDetail
                  show={curExpandRow.includes(index)}
                  response={props.results && props.results[index] ? props.results[index] : null}
                  request={postCheck}
               />
            </div>
         );
      });
   } else {
      apiList = <div className="shadow-sm p-3 mb-3 bg-light text-secondary rounded pointer">No API request configured.</div>;
   }

   return (
      <div className="container">
         {apiList}
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
      </div>
   );
};

export default PostCheck;

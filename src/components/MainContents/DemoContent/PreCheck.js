import React, { useState, useContext } from "react";
import ReactJson from "@uiw/react-json-view";
import GlobalContext from "../../contexts/ContextProvider";
import { Modal } from "../../../helper/modalHelper";
import ModalContentSelector from "../editForm/ModalContentSelector";
import RunButtonComponent from "../RunButtonComponent";
import WithInfoPopup from "../../Popper/InfoPopper";
import { getStringFromObject, getVariableDetails } from "../../contexts/Utility";

const PreCheckDetail = (props) => {
   let responseViewer;
   let responseStatus = props.response ? `${props.response.status} ${props.response.statusText}` : "";
   let failureCause = props.response && props.response.failureCause ? props.response.failureCause : "";
   let payloadViewer =
      props.request && props.request.data ? (
         <div className="p-2">
            payload
            <ReactJson value={props.request.data} collapsed={4} />
         </div>
      ) : null;
   let colorMapper = { get: "primary", post: "success", put: "info", patch: "warning", delete: "danger" };

   if (props.request && props.request.displayResponseAs === "text") {
      responseViewer = props.response ? (
         <pre className="p-2">{getStringFromObject(props.response.data, props.request.objectPath)}</pre>
      ) : null;
   } else {
      // default display response as JSON
      responseViewer = props.response ? (
         <ReactJson value={typeof props.response.data === "object" ? props.response.data : {}} collapsed={1} />
      ) : null;
   }

   const renderVariableDetails = () => {
      const variableDetails = getVariableDetails(props.request, props.variableLookup);
      return (
         <>
            {variableDetails.length > 0 && (
               <WithInfoPopup
                  PopperComponent={
                     <div className="d-flex flex-column p-2 text-nowrap text-dark">
                        {variableDetails.map((item, i) => {
                           return (
                              <div className="d-flex" key={i}>
                                 <small style={{ minWidth: "90px" }}>{item.key}: </small>
                                 <small>{item.val}</small>
                              </div>
                           );
                        })}
                     </div>
                  }
                  placement="left"
               >
                  <div className="badge text-bg-secondary">Variable</div>
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
               <WithInfoPopup
                  PopperComponent={
                     <div className="d-flex p-2 text-nowrap text-dark">
                        <small>{`${props.context.config.endpoints[props.request.useEndpoint].baseURL}`}</small>
                     </div>
                  }
                  placement="right"
               >
                  <span className="font-weight-light bg-secondary text-light p-1 ms-4 rounded">{props.request.useEndpoint}</span>
               </WithInfoPopup>
            </div>
            <div className="d-flex justify-content-between">
               {/* Polling */}
               <div className="me-2">
                  {props.request.type === "polling" && (
                     <WithInfoPopup
                        PopperComponent={
                           <div className="d-flex flex-column p-2 text-nowrap text-dark">
                              <div className="d-flex">
                                 <small style={{ minWidth: "130px" }}>Max Retry: </small>
                                 <small>{props.request.maxRetry}</small>
                              </div>
                              <div className="d-flex">
                                 <small style={{ minWidth: "130px" }}>Interval: </small>
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
                  {props.request.expect.length > 0 && (
                     <WithInfoPopup
                        PopperComponent={
                           <div className="d-flex flex-column p-2 text-nowrap text-dark">
                              {props.request.expect.map((item, i) => {
                                 let type = item.type;
                                 if (item.type === "codeIs") type = "responseCodeIs";

                                 return (
                                    <div className="d-flex" key={i}>
                                       <small style={{ minWidth: "130px" }}>{type}: </small>
                                       <small>{item.value}</small>
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
               <div className={`me-3 font-weight-bolder text-${colorMapper[props.request.method]}`}>
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

const PreCheck = (props) => {
   const [modal, setModal] = useState({ modalShow: false, modalContentType: null, selectedAction: null });
   const [curExpandRow, setCurExpandRow] = useState([]);
   const context = useContext(GlobalContext);

   const expandDetailHandler = (index) => {
      if (!curExpandRow.includes(index)) {
         setCurExpandRow((prev) => [...prev, index]);
      } else {
         setCurExpandRow(curExpandRow.filter((ele) => ele !== index));
      }
   };

   const isPreCheckRunning = (index) => {
      return props.currentRunning === index;
   };

   if (!props.show) return null;

   let apiList;
   // apiList component
   if (props.currentStepDetails.preCheck && props.currentStepDetails.preCheck.length !== 0) {
      apiList = props.currentStepDetails.preCheck.map((preCheck, index) => {
         //
         let runResultStatus =
            props.results && props.results[index] && !isPreCheckRunning(index) ? (
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
               <div
                  className={`shadow-sm p-3 mb-3 bg-light text-secondary rounded pointer ${
                     isPreCheckRunning(index) ? "border" : ""
                  }`}
                  onClick={() => expandDetailHandler(index)}
               >
                  <div className="d-flex justify-content-between">
                     <div className="d-flex align-items-center">
                        <div>
                           <div
                              className={`api-method-badge text-light me-3 rounded`}
                              style={{ backgroundColor: preCheck.headerColor ? preCheck.headerColor : "#007cad" }}
                           >
                              {preCheck.header ? preCheck.header : "NO HEADER"}
                           </div>
                           {preCheck.title ? preCheck.title : "NO TITLE"}
                        </div>
                        {runResultStatus}
                     </div>
                     <div className="d-flex align-items-center">
                        <RunButtonComponent
                           currentRunning={isPreCheckRunning(index)}
                           workflowHandler={() => props.workflowHandler(index)}
                           disable={isPreCheckRunning(index)}
                        />
                        {context.mode === "edit" && (
                           <div className="d-flex align-items-center">
                              <span
                                 className="px-1 font-sm font-weight-light text-info text-hover-highlight"
                                 onClick={(e) => {
                                    e.stopPropagation();
                                    setModal({
                                       modalShow: true,
                                       modalContentType: "preCheck",
                                       selectedAction: { action: preCheck, actionIndex: index },
                                    });
                                 }}
                              >
                                 Edit
                              </span>
                              <span
                                 className="pe-3 ps-1 font-sm font-weight-light text-danger text-hover-highlight"
                                 onClick={(e) => {
                                    e.stopPropagation();
                                    setModal({
                                       modalShow: true,
                                       modalContentType: "actionDeleteConfirm",
                                       selectedAction: { action: preCheck, actionIndex: index, tab: "preCheck" },
                                    });
                                 }}
                              >
                                 Delete
                              </span>
                           </div>
                        )}
                        <i className={`fas fa-caret-${curExpandRow.includes(index) ? "down" : "right"}`}></i>
                     </div>
                  </div>
               </div>
               <PreCheckDetail
                  show={curExpandRow.includes(index)}
                  response={props.results && props.results[index] ? props.results[index] : null}
                  request={preCheck}
                  context={context}
                  variableLookup={props.variableLookup}
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
               contentType={modal.modalContentType}
            />
         </Modal>
      </div>
   );
};

export default PreCheck;

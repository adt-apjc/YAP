import React, { useState, useContext } from "react";
import ReactJson from "@uiw/react-json-view";
import GlobalContext from "../../contexts/ContextProvider";
import { Modal } from "../../../helper/modalHelper";
import ModalContentSelector from "../editForm/ModalContentSelector";
import RunButtonComponent from "../RunButtonComponent";
import WithInfoPopup from "../../Popper/InfoPopper";

export const PostCheckDetail = ({ show, response, request }) => {
   const getStringFromObject = (obj, path) => {
      let result = obj;
      try {
         if (!path) return JSON.stringify(result, null, 3);
         for (let attr of path.split(".")) {
            result = result[attr];
         }
         return JSON.stringify(result, null, 3);
      } catch (e) {
         console.log(e);
         return `Cannot find value in path ${path}`;
      }
   };

   let responseViewer;
   let responseStatus = response ? `${response.status} ${response.statusText}` : "";
   let payloadViewer =
      request && request.data ? (
         <div className="p-2">
            payload
            <ReactJson value={request.data} collapsed={4} />
         </div>
      ) : (
         ""
      );
   let colorMapper = { get: "primary", post: "success", put: "info", patch: "warning", delete: "danger" };

   if (request && request.displayResponseAs === "text") {
      responseViewer = response ? <pre className="p-2">{getStringFromObject(response.data, request.objectPath)}</pre> : "";
   } else {
      // default display response as JSON
      responseViewer = response ? <ReactJson value={typeof response.data === "object" ? response.data : {}} collapsed={4} /> : "";
   }

   if (!show) return null;
   return (
      <div className="container position-relative bg-light pt-2 pb-3" style={{ top: "-15px" }}>
         <div className="p-2">{request ? request.description : ""}</div>
         <div className="d-flex justify-content-between p-2 mb-2">
            <div>
               Endpoint{" "}
               <WithInfoPopup
                  PopperComponent={
                     <div className="d-flex p-2 text-nowrap text-dark">
                        <small>{`${request.url}`}</small>
                     </div>
                  }
                  placement="right"
               >
                  <span className="font-weight-light bg-secondary text-light p-1 ms-4 rounded">{request.useEndpoint}</span>
               </WithInfoPopup>
            </div>
            <div>
               <WithInfoPopup
                  PopperComponent={
                     <div className="d-flex flex-column p-2 text-nowrap text-dark">
                        {request.expect.length > 0 ? (
                           <>
                              {request.expect.map((item) => {
                                 let type = item.type;
                                 if (item.type === "codeIs") type = "responseCodeIs";

                                 return (
                                    <div className="d-flex">
                                       <small style={{ minWidth: "130px" }}>{type}: </small>
                                       <small>{item.value}</small>
                                    </div>
                                 );
                              })}
                           </>
                        ) : (
                           <small>none</small>
                        )}
                     </div>
                  }
                  placement="left"
               >
                  <div className="badge text-bg-secondary">Expect</div>
               </WithInfoPopup>
            </div>
         </div>
         <div className="bg-white p-2 rounded shadow-sm mb-2">
            <div className="d-flex">
               <div className={`me-3 font-weight-bolder text-${colorMapper[request.method]}`}>{request.method.toUpperCase()}</div>
               <div className="text-dark">{request.url}</div>
            </div>
            {payloadViewer}
         </div>
         <div className="bg-white p-2 rounded shadow-sm">
            <div className="d-flex justify-content-between">
               Response
               <div className="font-weight-light" style={{ fontSize: "12px" }}>
                  {responseStatus}
               </div>
            </div>
            {responseViewer}
         </div>
      </div>
   );
};

const PostCheck = (props) => {
   const context = useContext(GlobalContext);
   const [modal, setModal] = useState({ modalShow: false, modalContentType: null, selectedAction: null });
   const [curExpandRow, setCurExpandRow] = useState([]);

   const expandDetailHandler = (index) => {
      if (!curExpandRow.includes(index)) {
         setCurExpandRow((prev) => [...prev, index]);
      } else {
         setCurExpandRow(curExpandRow.filter((ele) => ele !== index));
      }
   };

   const isPostCheckRunning = (index) => {
      return props.currentRunning === index;
   };

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
                  <i className="fad fa-exclamation-circle m-2 text-danger" />
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
               contentType={modal.modalContentType}
            />
         </Modal>
      </div>
   );
};

export default PostCheck;

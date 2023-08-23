import React, { useContext, useEffect, useState } from "react";
import GlobalContext from "../../contexts/ContextProvider";
import { useDidUpdateEffect } from "../../contexts/CustomHooks";
import { normalRequest, pollingRequest } from "../../../helper/actionHelper";
import { Modal } from "../../../helper/modalHelper";
import ModalContentSelector from "../editForm/ModalContentSelector";
import Actions from "./Actions";
import PostCheck from "./PostCheck";
import Outcome from "./Outcome";

import _ from "lodash";
import Logo from "../Logo";
import PreCheck from "./PreCheck";
import RunButtonComponent from "../RunButtonComponent";

const DemoContent = (props) => {
   const context = useContext(GlobalContext);
   const [modal, setModal] = useState({ modalShow: false, modalContentType: null, paramValues: null });
   const [currentRunning, setCurrentRunning] = useState({ preCheck: null, action: null, postCheck: null });
   const [isPreCheckCompleted, setIsPreCheckCompleted] = useState({ cleanup: false });
   const [isActionCompleted, setIsActionCompleted] = useState({ cleanup: false });
   const [isPostCheckCompleted, setIsPostCheckCompleted] = useState({ cleanup: false });
   const [preCheckResults, setPreCheckResults] = useState({ cleanup: {} });
   const [actionResults, setActionResults] = useState({ cleanup: {} });
   const [postCheckResults, setPostCheckResults] = useState({ cleanup: {} });
   const [sectionExpand, setSectionExpand] = useState({ preCheck: false, action: false, postCheck: false, outcome: false });

   const clearStateHandler = () => {
      setIsPreCheckCompleted({ cleanup: false });
      setIsActionCompleted({ cleanup: false });
      setIsPostCheckCompleted({ cleanup: false });
      setCurrentRunning({ preCheck: null, action: null, postCheck: null });
      setPreCheckResults((prev) => ({ cleanup: prev.cleanup }));
      setActionResults((prev) => ({ cleanup: prev.cleanup }));
      setPostCheckResults((prev) => ({ cleanup: prev.cleanup }));
      setModal({ modalShow: false, modalContentType: null });
      console.log("DEBUG - clear state from sidebar demoContent");
   };

   const runPreCheckWorkflowHandler = async (targetIndex = -1) => {
      let isCompleted = true;
      let { currentStepDetails } = props;
      // validate if it has preCheck configured or not
      if (!currentStepDetails.preCheck) return null;

      // set running status in global context
      context.setRunningStatus(props.currentStep.name, "running");

      // clear old state before start
      setCurrentRunning((prev) => ({ ...prev, preCheck: targetIndex >= 0 ? targetIndex : null }));
      if (targetIndex < 0) setPreCheckResults((prev) => ({ ...prev, [props.currentStep.name]: {} }));

      let preCheckList = targetIndex >= 0 ? [currentStepDetails.preCheck[targetIndex]] : currentStepDetails.preCheck;
      for (let [i, preCheck] of preCheckList.entries()) {
         let index = targetIndex >= 0 ? targetIndex : i;
         try {
            // SET current running state before start.
            setCurrentRunning((prev) => ({ ...prev, preCheck: index }));
            let response;
            if (preCheck.type === "request") {
               // normal request
               response = await normalRequest(preCheck, context.config.endpoints);
            } else if (preCheck.type === "polling") {
               // polling request
               response = await pollingRequest(preCheck, context.config.endpoints);
            }
            //
            if (!response.success) isCompleted = false;
            // update state preCheckResults for specific step
            setPreCheckResults((prev) => ({
               ...prev,
               [props.currentStep.name]: {
                  ...prev[props.currentStep.name],
                  [index]: response,
               },
            }));
            setCurrentRunning((prev) => ({ ...prev, preCheck: null }));
         } catch (e) {
            isCompleted = false;
            console.log(e);
            // update state preCheckResults for specific step
            setPreCheckResults((prev) => ({
               ...prev,
               [props.currentStep.name]: {
                  ...prev[props.currentStep.name],
                  [index]: e,
               },
            }));
            setCurrentRunning((prev) => ({ ...prev, preCheck: null }));
            // check continueOnFail
            if (!currentStepDetails.continueOnFail) break;
         }
      }
      // set status on section bar
      setIsPreCheckCompleted((prev) => ({ ...prev, [props.currentStep.name]: isCompleted }));
      // set running status in global context
      context.setRunningStatus(props.currentStep.name, "");
      return isCompleted;
   };

   const runActionWorkflowHandler = async (targetIndex = -1) => {
      let isCompleted = true;
      let { currentStepDetails } = props;
      // validate if it has action configured or not
      if (!currentStepDetails.actions) return null;

      // set running status in global context
      context.setRunningStatus(props.currentStep.name, "running");

      // clear old state before start
      setCurrentRunning((prev) => ({ ...prev, action: targetIndex >= 0 ? targetIndex : null }));
      if (targetIndex < 0) setActionResults((prev) => ({ ...prev, [props.currentStep.name]: {} }));

      let actionList = targetIndex >= 0 ? [currentStepDetails.actions[targetIndex]] : currentStepDetails.actions;
      for (let [i, action] of actionList.entries()) {
         let index = targetIndex >= 0 ? targetIndex : i;
         try {
            // SET current running state before start.
            setCurrentRunning((prev) => ({ ...prev, action: index }));
            let response;
            if (action.type === "request") {
               // normal request
               response = await normalRequest(action, context.config.endpoints);
            } else if (action.type === "polling") {
               // polling request
               response = await pollingRequest(action, context.config.endpoints);
            }
            //
            if (!response.success) isCompleted = false;
            // update state actionResults for specific step
            setActionResults((prev) => ({
               ...prev,
               [props.currentStep.name]: {
                  ...prev[props.currentStep.name],
                  [index]: response,
               },
            }));
            setCurrentRunning((prev) => ({ ...prev, action: null }));
         } catch (e) {
            isCompleted = false;
            console.log(e);
            // update state actionResults for specific step
            setActionResults((prev) => ({
               ...prev,
               [props.currentStep.name]: {
                  ...prev[props.currentStep.name],
                  [index]: e,
               },
            }));
            setCurrentRunning((prev) => ({ ...prev, action: null }));
            // check continueOnFail
            if (!currentStepDetails.continueOnFail) break;
         }
      }
      // set status on section bar
      setIsActionCompleted((prev) => ({ ...prev, [props.currentStep.name]: isCompleted }));
      // set running status in global context
      context.setRunningStatus(props.currentStep.name, "");
      return isCompleted;
   };

   const runPostCheckWorkflowHandler = async (targetIndex = -1) => {
      let isCompleted = true;
      let { currentStepDetails } = props;
      // validate if it has postCheck configured or not
      if (!currentStepDetails.postCheck) return null;

      // set running status in global context
      context.setRunningStatus(props.currentStep.name, "running");

      // clear old state before start
      setCurrentRunning((prev) => ({ ...prev, postCheck: targetIndex >= 0 ? targetIndex : null }));
      if (targetIndex < 0) setPostCheckResults((prev) => ({ ...prev, [props.currentStep.name]: {} }));

      let postCheckList = targetIndex >= 0 ? [currentStepDetails.postCheck[targetIndex]] : currentStepDetails.postCheck;
      for (let [i, postCheck] of postCheckList.entries()) {
         let index = targetIndex >= 0 ? targetIndex : i;
         try {
            // SET current running state before start.
            setCurrentRunning((prev) => ({ ...prev, postCheck: index }));
            let response;
            if (postCheck.type === "request") {
               // normal request
               response = await normalRequest(postCheck, context.config.endpoints);
            } else if (postCheck.type === "polling") {
               // polling request
               response = await pollingRequest(postCheck, context.config.endpoints);
            }
            //
            if (!response.success) isCompleted = false;
            // update state postCheckResults for specific step
            setPostCheckResults((prev) => ({
               ...prev,
               [props.currentStep.name]: {
                  ...prev[props.currentStep.name],
                  [index]: response,
               },
            }));
            setCurrentRunning((prev) => ({ ...prev, postCheck: null }));
         } catch (e) {
            isCompleted = false;
            console.log(e);
            // update state postCheckResults for specific step
            setPostCheckResults((prev) => ({
               ...prev,
               [props.currentStep.name]: {
                  ...prev[props.currentStep.name],
                  [index]: e,
               },
            }));
            setCurrentRunning((prev) => ({ ...prev, postCheck: null }));

            // check continueOnFail
            if (!currentStepDetails.continueOnFail) break;
         }
      }
      // set status on section bar
      setIsPostCheckCompleted((prev) => ({ ...prev, [props.currentStep.name]: isCompleted }));
      // set running status in global context
      context.setRunningStatus(props.currentStep.name, "");
      return isCompleted;
   };

   const startWorkflowHandler = async () => {
      // clear complete status of current step before start
      setIsPreCheckCompleted((prev) => ({ ...prev, [props.currentStep.name]: false }));
      setIsActionCompleted((prev) => ({ ...prev, [props.currentStep.name]: false }));
      setIsPostCheckCompleted((prev) => ({ ...prev, [props.currentStep.name]: false }));

      // Run pre checks
      let isPreCheckCompleted = await runPreCheckWorkflowHandler();
      if (!isPreCheckCompleted && !props.currentStepDetails.continueOnFail) {
         context.setRunningStatus(props.currentStep.name, "fail");
         return;
      }

      // Run action when pre check is successful
      let isActionCompleted = await runActionWorkflowHandler();
      if (!isActionCompleted && !props.currentStepDetails.continueOnFail) {
         context.setRunningStatus(props.currentStep.name, "fail");
         return;
      }

      // if it is cleanup module also run clearStateHandler() after runAction complete successfully
      if (props.currentStep.name === "cleanup" && isPreCheckCompleted && isActionCompleted) {
         context.clearStateHandler();
      }

      // after action complete delay 500 ms and start post check
      setTimeout(async () => {
         await runPostCheckWorkflowHandler();
      }, 500);
   };

   useEffect(() => {
      setSectionExpand({ preCheck: false, action: false, postCheck: false, outcome: false });
   }, [props.currentStep.name]);

   useEffect(() => {
      const savedState = JSON.parse(window.localStorage.getItem("mainContentState"));
      context.registerClearStateFunction(clearStateHandler, "demoContent");
      // load config from localStorage if exist
      if (savedState) {
         setIsPreCheckCompleted(savedState.isPreCheckCompleted);
         setIsActionCompleted(savedState.isActionCompleted);
         setIsPostCheckCompleted(savedState.isPostCheckCompleted);
         setPreCheckResults(savedState.preCheckResults);
         setActionResults(savedState.actionResults);
         setPostCheckResults(savedState.postCheckResults);
         console.log("DEBUG - load value from localStorage");
      }
      return () => context.unregisterClearStateFunction("demoContent");
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   useDidUpdateEffect(() => {
      // saveStateToLocalStorage
      window.localStorage.setItem(
         "mainContentState",
         JSON.stringify({
            preCheckResults,
            actionResults,
            postCheckResults,
            isPreCheckCompleted,
            isActionCompleted,
            isPostCheckCompleted,
         }),
      );
      // try to update sidebar status foreach step
      if (!preCheckResults[props.currentStep.name]) return;
      if (!actionResults[props.currentStep.name]) return;
      if (!postCheckResults[props.currentStep.name]) return;
      let _preCheckResults = Object.values(preCheckResults[props.currentStep.name]);
      if (_preCheckResults.length !== props.currentStepDetails.preCheck.length) return;
      let _actionResults = Object.values(actionResults[props.currentStep.name]);
      if (_actionResults.length !== props.currentStepDetails.actions.length) return;
      let _postCheckResults = Object.values(postCheckResults[props.currentStep.name]);
      if (_postCheckResults.length !== props.currentStepDetails.postCheck.length) return;

      let isAllPreCheckCompleted = _preCheckResults.every((el) => el.success);
      let isAllActionCompleted = _actionResults.every((el) => el.success);
      let isAllPostCheckCompleted = _postCheckResults.every((el) => el.success);
      // set globalContext status on sidebar
      context.setRunningStatus(
         props.currentStep.name,
         isAllPreCheckCompleted && isAllActionCompleted && isAllPostCheckCompleted ? "success" : "fail",
      );
   }, [preCheckResults, actionResults, postCheckResults, isPreCheckCompleted, isActionCompleted, isPostCheckCompleted]);

   let description = props.currentStepDetails.description;
   if (_.isArray(description)) {
      description = props.currentStepDetails.description.map((el, i) => {
         return (
            <div
               key={i}
               className="text-justify"
               dangerouslySetInnerHTML={{
                  __html: el,
               }}
            ></div>
         );
      });
   }

   return (
      <>
         {/* HEADER SECTION */}
         <div className="d-flex justify-content-between">
            <div className="d-flex flex-column">
               <div className="d-flex">
                  <Logo />
                  <div style={{ fontSize: "25px" }}>{props.currentStep.label}</div>
               </div>
               <div className="my-2 me-3">{description}</div>
               {context.mode === "edit" && (
                  <div className="d-flex">
                     <span
                        className="text-info font-sm pointer text-hover-highlight"
                        onClick={() =>
                           setModal({
                              modalShow: true,
                              modalContentType: "editStepDescription",
                              paramValues: {
                                 title: props.currentStep.label,
                                 description: props.currentStepDetails.description,
                              },
                           })
                        }
                     >
                        Edit
                     </span>
                  </div>
               )}
            </div>

            <div className="text-nowrap">
               <button
                  className="btn btn-sm btn-primary float-right align-self-center"
                  onClick={startWorkflowHandler}
                  disabled={Object.values(currentRunning).some((el) => el !== null)}
               >
                  {Object.values(currentRunning).some((el) => el !== null) ? (
                     <i className="fas fa-spinner fa-spin m-1" />
                  ) : (
                     "Run All"
                  )}
               </button>
            </div>
         </div>
         <div className="mt-3 mb-4" style={{ borderBottom: "1px solid #eaeaea" }}></div>
         {/* PRE-CHECK */}
         <div className="section-container my-1">
            <div
               className="section-header d-flex justify-content-between pointer"
               onClick={() => setSectionExpand((prev) => ({ ...prev, preCheck: !prev.preCheck }))}
            >
               <div className="d-flex align-items-center">
                  <span className="font-weight-bold">Pre-Check</span>

                  {isPreCheckCompleted[props.currentStep.name] && props.currentStepDetails.preCheck.length > 0 ? (
                     <i className="fad fa-check-circle m-2 text-success" />
                  ) : (
                     <>
                        {preCheckResults[props.currentStep.name] !== undefined &&
                        Object.values(preCheckResults[props.currentStep.name]).filter((e) => e.success === false).length > 0 ? (
                           <i className="fad fa-exclamation-circle m-2 text-danger" />
                        ) : null}
                     </>
                  )}
               </div>

               <div className="d-flex align-items-center">
                  <RunButtonComponent
                     currentRunning={currentRunning.preCheck !== null}
                     workflowHandler={runPreCheckWorkflowHandler}
                     disable={props.currentStepDetails.preCheck.length === 0}
                  />
                  <div>
                     {context.mode === "edit" && (
                        <span
                           className="text-info font-sm text-hover-highlight pointer"
                           onClick={(e) => {
                              e.stopPropagation();
                              setModal({ modalShow: true, modalContentType: "preCheck" });
                           }}
                        >
                           Add
                        </span>
                     )}
                     <i className={`p-2 fas fa-caret-${sectionExpand.preCheck ? "down" : "right"}`}></i>
                  </div>
               </div>
            </div>
            <PreCheck
               show={sectionExpand.preCheck}
               currentStepDetails={props.currentStepDetails}
               currentRunning={currentRunning.preCheck}
               results={preCheckResults[props.currentStep.name]}
               workflowHandler={runPreCheckWorkflowHandler}
            />
         </div>
         {/* ACTION */}
         <div className="section-container my-1">
            <div
               className="section-header d-flex justify-content-between pointer"
               onClick={() => setSectionExpand((prev) => ({ ...prev, action: !prev.action }))}
            >
               <div className="d-flex align-items-center">
                  <span className="font-weight-bold">Actions</span>

                  {isActionCompleted[props.currentStep.name] && props.currentStepDetails.actions.length > 0 ? (
                     <i className="fad fa-check-circle m-2 text-success" />
                  ) : (
                     <>
                        {actionResults[props.currentStep.name] !== undefined &&
                        Object.values(actionResults[props.currentStep.name]).filter((e) => e.success === false).length > 0 ? (
                           <i className="fad fa-exclamation-circle m-2 text-danger" />
                        ) : null}
                     </>
                  )}
               </div>

               <div className="d-flex align-items-center">
                  <RunButtonComponent
                     currentRunning={currentRunning.action !== null}
                     workflowHandler={runActionWorkflowHandler}
                     disable={props.currentStepDetails.actions.length === 0}
                  />
                  {context.mode === "edit" && (
                     <span
                        className="text-info font-sm text-hover-highlight pointer"
                        onClick={(e) => {
                           e.stopPropagation();
                           setModal({ modalShow: true, modalContentType: "action" });
                        }}
                     >
                        Add
                     </span>
                  )}

                  <i className={`p-2 fas fa-caret-${sectionExpand.action ? "down" : "right"}`}></i>
               </div>
            </div>
            <Actions
               show={sectionExpand.action}
               currentStepDetails={props.currentStepDetails}
               currentRunning={currentRunning.action}
               results={actionResults[props.currentStep.name]}
               workflowHandler={runActionWorkflowHandler}
            />
         </div>
         {/* POST-CHECK */}
         <div className="section-container my-1">
            <div
               className="section-header d-flex justify-content-between pointer"
               onClick={() => setSectionExpand((prev) => ({ ...prev, postCheck: !prev.postCheck }))}
            >
               <div className="d-flex align-items-center">
                  <span className="font-weight-bold">Post-Check</span>
                  {isPostCheckCompleted[props.currentStep.name] && props.currentStepDetails.postCheck.length > 0 ? (
                     <i className="fad fa-check-circle m-2 text-success" />
                  ) : (
                     <>
                        {isPostCheckCompleted[props.currentStep.name] !== undefined &&
                        Object.values(isPostCheckCompleted[props.currentStep.name]).filter((e) => e.success === false).length >
                           0 ? (
                           <i className="fad fa-exclamation-circle m-2 text-danger" />
                        ) : null}
                     </>
                  )}
               </div>
               <div className="d-flex align-items-center">
                  <RunButtonComponent
                     currentRunning={currentRunning.postCheck !== null}
                     workflowHandler={runPostCheckWorkflowHandler}
                     disable={props.currentStepDetails.postCheck.length === 0}
                  />
                  {context.mode === "edit" && (
                     <span
                        className="text-info font-sm text-hover-highlight pointer"
                        onClick={(e) => {
                           e.stopPropagation();
                           setModal({ modalShow: true, modalContentType: "postCheck" });
                        }}
                     >
                        Add
                     </span>
                  )}

                  <i className={`p-2 fas fa-caret-${sectionExpand.postCheck ? "down" : "right"}`}></i>
               </div>
            </div>
            <PostCheck
               show={sectionExpand.postCheck}
               currentStepDetails={props.currentStepDetails}
               currentRunning={currentRunning.postCheck}
               results={postCheckResults[props.currentStep.name]}
               workflowHandler={runPostCheckWorkflowHandler}
            />
         </div>
         {/* OUTCOME */}
         <div className="section-container my-1">
            <div
               className="section-header d-flex justify-content-between pointer"
               onClick={() => setSectionExpand((prev) => ({ ...prev, outcome: !prev.outcome }))}
            >
               <div>
                  <span className="font-weight-bold">Outcome</span>
                  <span className="font-weight-light mx-5">
                     {props.currentStepDetails.outcome && props.currentStepDetails.outcome.summaryText}
                  </span>
               </div>
               <div>
                  {context.mode === "edit" && (
                     <span
                        className="text-info font-sm text-hover-highlight pointer"
                        onClick={(e) => {
                           e.stopPropagation();
                           setModal({
                              modalShow: true,
                              modalContentType: "editOutcome",
                              paramValues: props.currentStepDetails.outcome,
                           });
                        }}
                     >
                        Edit
                     </span>
                  )}
                  <i className={`p-2 fas fa-caret-${sectionExpand.outcome ? "down" : "right"}`}></i>
               </div>
            </div>
            <Outcome show={sectionExpand.outcome} currentStepDetails={props.currentStepDetails} />
         </div>
         <Modal
            show={modal.modalShow}
            onHide={() => setModal({ modalShow: false, modalContentType: null, paramValues: null })}
            width="70%"
         >
            <ModalContentSelector
               onHide={() => setModal({ modalShow: false, modalContentType: null, paramValues: null })}
               initValue={modal.paramValues}
               contentType={modal.modalContentType}
            />
         </Modal>
      </>
   );
};

export default DemoContent;
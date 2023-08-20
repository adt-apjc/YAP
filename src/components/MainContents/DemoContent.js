import React, { useContext, useEffect, useState } from "react";
import GlobalContext from "../contexts/ContextProvider";
import { useDidUpdateEffect } from "../contexts/CustomHooks";
import { normalRequest, pollingRequest } from "../../helper/actionHelper";
import { Modal } from "../../helper/modalHelper";
import ModalContentSelector from "./editForm/ModalContentSelector";
import Actions from "./Actions";
import Validations from "./Validations";
import Outcome from "./Outcome";

import _ from "lodash";
import Logo from "./Logo";
import PreCheck from "./PreCheck";
import RunButtonComponent from "./RunButtonComponent";

const DemoContent = (props) => {
   const context = useContext(GlobalContext);
   const [modal, setModal] = useState({ modalShow: false, modalContentType: null, paramValues: null });
   const [currentRunning, setCurrentRunning] = useState({ preCheck: null, action: null, validation: null });
   const [isActionCompleted, setIsActionCompleted] = useState({ cleanup: false });
   const [isValidationCompleted, setIsValidationCompleted] = useState({ cleanup: false });
   const [actionResults, setActionResults] = useState({ cleanup: {} });
   const [validationResults, setValidationResults] = useState({ cleanup: {} });
   const [sectionExpand, setSectionExpand] = useState({ preCheck: false, action: false, validation: false, outcome: false });

   const clearStateHandler = () => {
      setIsActionCompleted({ cleanup: false });
      setIsValidationCompleted({ cleanup: false });
      setCurrentRunning({ preCheck: null, action: null, validation: null });
      setActionResults((prev) => ({ cleanup: prev.cleanup }));
      setValidationResults((prev) => ({ cleanup: prev.cleanup }));
      setModal({ modalShow: false, modalContentType: null });
      console.log("DEBUG - clear state from sidebar demoContent");
   };

   const runActionWorkflowHandler = async () => {
      let isCompleted = true;
      let { currentStepDetails } = props;
      // clear old state before start
      setCurrentRunning((prev) => ({ ...prev, action: null }));
      setActionResults((prev) => ({ ...prev, [props.currentStep.name]: {} }));

      // validate if it has validation configured or not
      if (!currentStepDetails.actions) return null;
      //

      for (let [index, action] of currentStepDetails.actions.entries()) {
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
      return isCompleted;
   };

   const runValidationWorkflowHandler = async () => {
      let isCompleted = true;
      let { currentStepDetails } = props;
      // clear old state before start
      setCurrentRunning((prev) => ({ ...prev, validation: null }));
      setValidationResults((prev) => ({ ...prev, [props.currentStep.name]: {} }));

      // validate if it has validation configured or not
      if (!currentStepDetails.validations) return true;

      // start
      for (let [index, validation] of currentStepDetails.validations.entries()) {
         // SET current running state before start.
         setCurrentRunning((prev) => ({ ...prev, validation: index }));
         try {
            let response;
            if (validation.type === "request") {
               // normal request
               response = await normalRequest(validation, context.config.endpoints);
            } else if (validation.type === "polling") {
               // polling request
               response = await pollingRequest(validation, context.config.endpoints);
            }
            //
            if (!response.success) isCompleted = false;
            // update state validationResults for specific step
            setValidationResults((prev) => ({
               ...prev,
               [props.currentStep.name]: {
                  ...prev[props.currentStep.name],
                  [index]: response,
               },
            }));
            setCurrentRunning((prev) => ({ ...prev, validation: null }));
         } catch (e) {
            isCompleted = false;
            console.log(e);
            // update state validationResults for specific step
            setValidationResults((prev) => ({
               ...prev,
               [props.currentStep.name]: {
                  ...prev[props.currentStep.name],
                  [index]: e,
               },
            }));
            setCurrentRunning((prev) => ({ ...prev, validation: null }));

            // check continueOnFail
            if (!currentStepDetails.continueOnFail) break;
         }
      }
      // set status on section bar
      setIsValidationCompleted((prev) => ({ ...prev, [props.currentStep.name]: isCompleted }));
      return isCompleted;
   };

   const startWorkflowHandler = async () => {
      // set running status in global context
      context.setRunningStatus(props.currentStep.name, "running");
      // clear complete status of current step before start
      setIsActionCompleted((prev) => ({ ...prev, [props.currentStep.name]: false }));
      setIsValidationCompleted((prev) => ({ ...prev, [props.currentStep.name]: false }));
      //
      let isActionCompleted = await runActionWorkflowHandler();
      if (!isActionCompleted && !props.currentStepDetails.continueOnFail) {
         context.setRunningStatus(props.currentStep.name, "fail");
         return;
      }
      // if it is cleanup module also run clearStateHandler() after runAction complete successfully
      if (props.currentStep.name === "cleanup" && isActionCompleted) {
         context.clearStateHandler();
      }
      // after action complete delay 500 ms and start validation
      setTimeout(async () => {
         let isValidationCompleted = await runValidationWorkflowHandler();
         // set globalContext status on sidebar
         context.setRunningStatus(props.currentStep.name, isActionCompleted && isValidationCompleted ? "success" : "fail");
      }, 500);
   };

   useEffect(() => {
      setSectionExpand({ preCheck: false, action: false, validation: false, outcome: false });
   }, [props.currentStep.name]);

   useEffect(() => {
      const savedState = JSON.parse(window.localStorage.getItem("mainContentState"));
      context.registerClearStateFunction(clearStateHandler, "demoContent");
      // load config from localStorage if exist
      if (savedState) {
         setIsActionCompleted(savedState.isActionCompleted);
         setIsValidationCompleted(savedState.isValidationCompleted);
         setActionResults(savedState.actionResults);
         setValidationResults(savedState.validationResults);
         console.log("DEBUG - load value from localStorage");
      }
      return () => context.unregisterClearStateFunction("demoContent");
   }, []);

   // saveStateToLocalStorage
   useDidUpdateEffect(() => {
      window.localStorage.setItem(
         "mainContentState",
         JSON.stringify({ actionResults, validationResults, isActionCompleted, isValidationCompleted }),
      );
   }, [actionResults, validationResults, isActionCompleted, isValidationCompleted]);

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
               <span className="font-weight-bold">Pre-Check</span>
               <div className="d-flex align-items-center">
                  <RunButtonComponent currentRunning={null} workflowHandler={() => null} disable={true} />
                  <div>
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
                     <i className={`p-2 fas fa-caret-${sectionExpand.preCheck ? "down" : "right"}`}></i>
                  </div>
               </div>
            </div>
            <PreCheck show={sectionExpand.preCheck} />
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
               onClick={() => setSectionExpand((prev) => ({ ...prev, validation: !prev.validation }))}
            >
               <div className="d-flex align-items-center">
                  <span className="font-weight-bold">Post-Check</span>
                  {isValidationCompleted[props.currentStep.name] && props.currentStepDetails.validations.length > 0 ? (
                     <i className="fad fa-check-circle m-2 text-success" />
                  ) : (
                     <>
                        {isValidationCompleted[props.currentStep.name] !== undefined &&
                        Object.values(isValidationCompleted[props.currentStep.name]).filter((e) => e.success === false).length >
                           0 ? (
                           <i className="fad fa-exclamation-circle m-2 text-danger" />
                        ) : null}
                     </>
                  )}
               </div>
               <div className="d-flex align-items-center">
                  <RunButtonComponent
                     currentRunning={currentRunning.validation !== null}
                     workflowHandler={runValidationWorkflowHandler}
                     disable={props.currentStepDetails.validations.length === 0}
                  />
                  {context.mode === "edit" && (
                     <span
                        className="text-info font-sm text-hover-highlight pointer"
                        onClick={(e) => {
                           e.stopPropagation();
                           setModal({ modalShow: true, modalContentType: "validation" });
                        }}
                     >
                        Add
                     </span>
                  )}

                  <i className={`p-2 fas fa-caret-${sectionExpand.validation ? "down" : "right"}`}></i>
               </div>
            </div>
            <Validations
               show={sectionExpand.validation}
               currentStepDetails={props.currentStepDetails}
               currentRunning={currentRunning.validation}
               results={validationResults[props.currentStep.name]}
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
                     {props.currentStepDetails.outcome && context.runningStatus[props.currentStep.name] === "success"
                        ? props.currentStepDetails.outcome.summaryText
                        : ""}
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

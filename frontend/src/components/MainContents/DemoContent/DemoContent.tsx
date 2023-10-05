import { useEffect, useState } from "react";
import { useGlobalContext } from "../../contexts/ContextProvider";
import { useDidUpdateEffect } from "../../contexts/CustomHooks";
import { normalRequest, pollingRequest } from "../../../helper/actionHelper";
import { Modal } from "../../../helper/modalHelper";
import ModalContentSelector from "../editForm/ModalContentSelector";
import Actions from "./Actions";
import PostCheck from "./PostCheck";
import Outcome from "./Outcome";
import PreCheck from "./PreCheck";
import RunButtonComponent from "../RunButtonComponent";
import OffCanvas from "../../OffCanvas/OffCanvas";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { StepDetails } from "../../contexts/ContextTypes";
import { APIResponse } from "../../../helper/apiAction";
import { CopyDestSelector } from "./CopyDestSelector";
import WithDropdown from "../../Popper/Dropdown";

type StepResult = {
   [step: string]: { [index: number]: APIResponse } | undefined;
};

type StepComplete = {
   [step: string]: boolean;
};

type DemoContentProps = {
   currentStep: { name: string; label: string };
   currentStepDetails: StepDetails;
};

const DemoContent = (props: DemoContentProps) => {
   const { context, dispatch } = useGlobalContext();
   const [modal, setModal] = useState<{
      modalShow: boolean;
      modalContentType: string | null;
      paramValues: any;
   }>({ modalShow: false, modalContentType: null, paramValues: null });
   const [currentRunning, setCurrentRunning] = useState<{
      preCheck: number | null;
      action: number | null;
      postCheck: number | null;
   }>({ preCheck: null, action: null, postCheck: null });
   const [isPreCheckCompleted, setIsPreCheckCompleted] = useState<StepComplete>({ cleanup: false });
   const [isActionCompleted, setIsActionCompleted] = useState<StepComplete>({ cleanup: false });
   const [isPostCheckCompleted, setIsPostCheckCompleted] = useState<StepComplete>({ cleanup: false });
   const [preCheckResults, setPreCheckResults] = useState<StepResult>({ cleanup: {} });
   const [actionResults, setActionResults] = useState<StepResult>({ cleanup: {} });
   const [postCheckResults, setPostCheckResults] = useState<StepResult>({ cleanup: {} });
   const [sectionExpand, setSectionExpand] = useState({ preCheck: false, action: false, postCheck: false, outcome: true });
   const [showOffCanvas, setShowOffCanvas] = useState(false);
   const hideOutcomeNameList = ["stage", "cleanup", "unstage"];
   const [isClearVarChecked, setIsClearVarChecked] = useState(true);

   // clear check icons for all sections when re-running All
   const clearChecksHandler = () => {
      setIsPreCheckCompleted((prev) => ({ ...prev, [props.currentStep.name]: false }));
      setIsActionCompleted((prev) => ({ ...prev, [props.currentStep.name]: false }));
      setIsPostCheckCompleted((prev) => ({ ...prev, [props.currentStep.name]: false }));
   };

   // clear vars in storage
   const clearVarsHandler = () => {
      let keys = [];
      for (let i = 0; i < localStorage.length; i++) {
         if (localStorage.key(i) === "__internal__configData") continue;
         keys.push(localStorage.key(i));
      }
      keys.forEach((k) => localStorage.removeItem(k!));
   };

   const clearStateHandler = () => {
      // clear result state
      setIsPreCheckCompleted({ cleanup: false });
      setIsActionCompleted({ cleanup: false });
      setIsPostCheckCompleted({ cleanup: false });
      setCurrentRunning({ preCheck: null, action: null, postCheck: null });
      setPreCheckResults((prev) => ({ cleanup: prev.cleanup }));
      setActionResults((prev) => ({ cleanup: prev.cleanup }));
      setPostCheckResults((prev) => ({ cleanup: prev.cleanup }));
      // clear modal params
      setModal({ modalShow: false, modalContentType: null, paramValues: null });

      console.log("DEBUG - clear state from sidebar demoContent");
   };

   const runPreCheckWorkflowHandler = async (targetIndex = -1) => {
      setIsPreCheckCompleted((prev) => ({ ...prev, [props.currentStep.name]: false }));
      let isCompleted = true;
      let { currentStepDetails } = props;
      // validate if it has preCheck configured or not
      if (!currentStepDetails.preCheck) return null;
      if (!props.currentStep.name) return null;
      if (currentStepDetails.preCheck.length === 0) return true;

      // set running status in global context
      dispatch({ type: "setRunningStatus", payload: { step: props.currentStep.name, status: "running" } });

      // clear old state before start
      setCurrentRunning((prev) => ({ ...prev, preCheck: targetIndex >= 0 ? targetIndex : null }));

      let preCheckList = targetIndex >= 0 ? [currentStepDetails.preCheck[targetIndex]] : currentStepDetails.preCheck;
      for (let [i, preCheck] of preCheckList.entries()) {
         // clear old result
         setPreCheckResults((prev) => {
            if (prev[props.currentStep.name]) delete prev[props.currentStep.name]![index];
            return prev;
         });

         let index = targetIndex >= 0 ? targetIndex : i;
         try {
            // SET current running state before start.
            setCurrentRunning((prev) => ({ ...prev, preCheck: index }));
            let response: APIResponse;
            if (preCheck.type === "request") {
               // normal request
               response = await normalRequest(preCheck, context.config);
            } else if (preCheck.type === "polling") {
               // polling request
               response = await pollingRequest(preCheck, context.config);
            }

            //
            if (!response!.success) isCompleted = false;
            // update state preCheckResults for specific step
            setPreCheckResults((prev) => ({
               ...prev,
               [props.currentStep.name]: {
                  ...prev[props.currentStep.name],
                  [index]: response,
               },
            }));
            setCurrentRunning((prev) => ({ ...prev, preCheck: null }));
         } catch (e: any) {
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
      dispatch({ type: "setRunningStatus", payload: { step: props.currentStep.name, status: "" } });
      return isCompleted;
   };

   const runActionWorkflowHandler = async (targetIndex = -1) => {
      setIsActionCompleted((prev) => ({ ...prev, [props.currentStep.name]: false }));
      let isCompleted = true;
      let { currentStepDetails } = props;
      // validate if it has action configured or not
      if (!currentStepDetails.actions) return null;
      if (currentStepDetails.actions.length === 0) return true;

      // set running status in global context
      dispatch({ type: "setRunningStatus", payload: { step: props.currentStep.name, status: "running" } });

      // clear running state before start
      setCurrentRunning((prev) => ({ ...prev, action: targetIndex >= 0 ? targetIndex : null }));

      let actionList = targetIndex >= 0 ? [currentStepDetails.actions[targetIndex]] : currentStepDetails.actions;
      for (let [i, action] of actionList.entries()) {
         // clear old result
         setActionResults((prev) => {
            if (prev[props.currentStep.name]) delete prev[props.currentStep.name]![index];
            return prev;
         });

         let index = targetIndex >= 0 ? targetIndex : i;
         try {
            // SET current running state before start.
            setCurrentRunning((prev) => ({ ...prev, action: index }));
            let response: APIResponse;
            if (action.type === "request") {
               // normal request
               response = await normalRequest(action, context.config);
            } else if (action.type === "polling") {
               // polling request
               response = await pollingRequest(action, context.config);
            } else {
               return false;
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
         } catch (e: any) {
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
      dispatch({ type: "setRunningStatus", payload: { step: props.currentStep.name, status: "" } });
      return isCompleted;
   };

   const runPostCheckWorkflowHandler = async (targetIndex = -1) => {
      setIsPostCheckCompleted((prev) => ({ ...prev, [props.currentStep.name]: false }));
      let isCompleted = true;
      let { currentStepDetails } = props;
      // validate if it has postCheck configured or not
      if (!currentStepDetails.postCheck) return null;
      if (currentStepDetails.postCheck.length === 0) return true;

      // set running status in global context
      dispatch({ type: "setRunningStatus", payload: { step: props.currentStep.name, status: "running" } });

      // clear old state before start
      setCurrentRunning((prev) => ({ ...prev, postCheck: targetIndex >= 0 ? targetIndex : null }));

      let postCheckList = targetIndex >= 0 ? [currentStepDetails.postCheck[targetIndex]] : currentStepDetails.postCheck;
      for (let [i, postCheck] of postCheckList.entries()) {
         // clear old result
         setPostCheckResults((prev) => {
            if (prev[props.currentStep.name]) delete prev[props.currentStep.name]![index];
            return prev;
         });

         let index = targetIndex >= 0 ? targetIndex : i;
         try {
            // SET current running state before start.
            setCurrentRunning((prev) => ({ ...prev, postCheck: index }));
            let response: APIResponse;
            if (postCheck.type === "request") {
               // normal request
               response = await normalRequest(postCheck, context.config);
            } else if (postCheck.type === "polling") {
               // polling request
               response = await pollingRequest(postCheck, context.config);
            } else {
               return false;
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
         } catch (e: any) {
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
      dispatch({ type: "setRunningStatus", payload: { step: props.currentStep.name, status: "" } });
      return isCompleted;
   };

   const startWorkflowHandler = async () => {
      // clear check icons
      clearChecksHandler();
      // clear complete status of current step before start
      setPreCheckResults((prev) => ({ ...prev, [props.currentStep.name]: undefined }));
      setActionResults((prev) => ({ ...prev, [props.currentStep.name]: undefined }));
      setPostCheckResults((prev) => ({ ...prev, [props.currentStep.name]: undefined }));

      // Run pre checks
      let isPreCheckCompleted = await runPreCheckWorkflowHandler();
      if (!isPreCheckCompleted && !props.currentStepDetails.continueOnFail) {
         dispatch({ type: "setRunningStatus", payload: { step: props.currentStep.name, status: "fail" } });
         return;
      }

      // Run action when pre check is successful
      let isActionCompleted = await runActionWorkflowHandler();
      if (!isActionCompleted && !props.currentStepDetails.continueOnFail) {
         dispatch({ type: "setRunningStatus", payload: { step: props.currentStep.name, status: "fail" } });
         return;
      }

      // if it is cleanup module also run clearStateHandler() after runAction complete successfully
      if (props.currentStep.name === "cleanup" && isPreCheckCompleted && isActionCompleted) {
         dispatch({ type: "setRunningStatus" }); // clear sidebar complete status
         if (isClearVarChecked) clearVarsHandler(); // clear variables in storage
         clearStateHandler();
      }

      // after action complete delay 500 ms and start post check
      setTimeout(async () => {
         await runPostCheckWorkflowHandler();
      }, 500);
   };

   useEffect(() => {
      setSectionExpand({ preCheck: false, action: false, postCheck: false, outcome: true });
      // set clear var state based on config file
      if (props.currentStep.name === "cleanup") {
         let clearVars = context.config.mainContent[props.currentStep.name].clearVariables;
         if (clearVars === undefined) clearVars = true; // default
         setIsClearVarChecked(clearVars);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [props.currentStep.name]);

   useEffect(() => {
      const savedState = JSON.parse(window.localStorage.getItem("__internal__mainContentState") as string);

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
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   useDidUpdateEffect(() => {
      if (!props.currentStep.name) return;
      // saveStateToLocalStorage
      window.localStorage.setItem(
         "__internal__mainContentState",
         JSON.stringify({
            preCheckResults,
            actionResults,
            postCheckResults,
            isPreCheckCompleted,
            isActionCompleted,
            isPostCheckCompleted,
         }),
      );
      let isAllPreCheckCompleted: boolean | undefined = undefined;
      let isAllActionCompleted: boolean | undefined = undefined;
      let isAllPostCheckCompleted: boolean | undefined = undefined;
      // try to update sidebar status foreach step
      if (preCheckResults[props.currentStep.name]) {
         let _preCheckResults = Object.values(preCheckResults[props.currentStep.name] || {});
         if (_preCheckResults.length === props.currentStepDetails.preCheck.length)
            isAllPreCheckCompleted = _preCheckResults.every((el) => el.success);
      }
      if (actionResults[props.currentStep.name]) {
         let _actionResults = Object.values(actionResults[props.currentStep.name] || {});
         if (_actionResults.length === props.currentStepDetails.actions.length)
            isAllActionCompleted = _actionResults.every((el) => el.success);
      }
      if (postCheckResults[props.currentStep.name]) {
         let _postCheckResults = Object.values(postCheckResults[props.currentStep.name] || {});
         if (_postCheckResults.length === props.currentStepDetails.postCheck.length)
            isAllPostCheckCompleted = _postCheckResults.every((el) => el.success);
      }

      // set status on section bar
      if (isAllPreCheckCompleted !== undefined)
         setIsPreCheckCompleted((prev) => ({ ...prev, [props.currentStep.name!]: isAllPreCheckCompleted! }));
      if (isAllActionCompleted !== undefined)
         setIsActionCompleted((prev) => ({ ...prev, [props.currentStep.name!]: isAllActionCompleted! }));
      if (isAllPostCheckCompleted !== undefined)
         setIsPostCheckCompleted((prev) => ({ ...prev, [props.currentStep.name!]: isAllPostCheckCompleted! }));

      // set globalContext status on sidebar
      if (props.currentStepDetails.preCheck.length === 0) isAllPreCheckCompleted = true;
      if (props.currentStepDetails.actions.length === 0) isAllActionCompleted = true;
      if (props.currentStepDetails.postCheck.length === 0) isAllPostCheckCompleted = true;

      if (isAllPreCheckCompleted !== undefined && isAllActionCompleted !== undefined && isAllPostCheckCompleted !== undefined)
         dispatch({
            type: "setRunningStatus",
            payload: {
               step: props.currentStep.name,
               status: isAllPreCheckCompleted && isAllActionCompleted && isAllPostCheckCompleted ? "success" : "fail",
            },
         });
   }, [preCheckResults, actionResults, postCheckResults]);

   let description = props.currentStepDetails.description;

   // clear var checkbox handler
   const handleClearVarChange = () => {
      setIsClearVarChecked(!isClearVarChecked);
   };

   return (
      <>
         {/* HEADER SECTION */}
         <div className="d-flex  flex-column">
            <div className="d-flex justify-content-between">
               {/* Step label */}
               <div style={{ fontSize: "25px" }}>{props.currentStep.label}</div>
               {/* Actions*/}
               <div className={`${hideOutcomeNameList.includes(props.currentStep.name) ? "d-flex align-items-center" : ""}`}>
                  <div className="d-flex align-items-center demo-content-actions">
                     <div
                        title="run all"
                        className={`demo-content-action text-primary pointer ${
                           Object.values(currentRunning).some((el) => el !== null) ? "disabled" : ""
                        }`}
                        onClick={startWorkflowHandler}
                     >
                        {Object.values(currentRunning).some((el) => el !== null) ? (
                           <i className="fas fa-spinner fa-spin" />
                        ) : (
                           <i className="fad fa-play-circle" />
                        )}
                     </div>
                     {!hideOutcomeNameList.includes(props.currentStep.name) ? (
                        <div
                           title="show preface"
                           className="demo-content-action pointer"
                           onClick={() => setShowOffCanvas(!showOffCanvas)}
                        >
                           <i className="fal fa-bars" />
                        </div>
                     ) : (
                        <>
                           {props.currentStep.name === "cleanup" && (
                              <div className="demo-content-action pointer" onClick={handleClearVarChange}>
                                 <input
                                    type="checkbox"
                                    className="form-check-input form-check-input-sm "
                                    checked={isClearVarChecked}
                                    onChange={handleClearVarChange}
                                 />
                                 <small>Clear Variables</small>
                              </div>
                           )}
                        </>
                     )}
                  </div>
               </div>
            </div>
            <div className="my-2 me-3">
               {description && (
                  <ReactMarkdown
                     children={description}
                     // @ts-ignore
                     rehypePlugins={[rehypeRaw]}
                  />
               )}
            </div>
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
         <div className="mt-3 mb-4" style={{ borderBottom: "1px solid #eaeaea" }}></div>
         {/* PRE-CHECK */}
         {context.mode === "presentation" && context.config.mainContent[props.currentStep.name].preCheck.length === 0 ? null : (
            <div className="section-container my-1">
               <div
                  className="section-header d-flex justify-content-between pointer"
                  onClick={() => setSectionExpand((prev) => ({ ...prev, preCheck: !prev.preCheck }))}
               >
                  <div className="d-flex align-items-center">
                     <span>Pre-Check</span>

                     {isPreCheckCompleted[props.currentStep.name] && props.currentStepDetails.preCheck.length > 0 ? (
                        <i className="fad fa-check-circle m-2 text-success" />
                     ) : (
                        <>
                           {preCheckResults[props.currentStep.name] !== undefined &&
                           Object.values(preCheckResults[props.currentStep.name] || {}).filter((e) => e.success === false)
                              .length > 0 ? (
                              <i className="fad fa-exclamation-circle m-2 text-danger" />
                           ) : null}
                        </>
                     )}
                  </div>

                  <div className="d-flex align-items-center">
                     <RunButtonComponent
                        currentRunning={currentRunning.preCheck !== null}
                        workflowHandler={runPreCheckWorkflowHandler}
                        disable={props.currentStepDetails.preCheck && props.currentStepDetails.preCheck.length === 0}
                     />
                     <div>
                        {context.mode === "edit" && (
                           <span
                              className="btn btn-xs btn-outline-secondary"
                              onClick={(e) => {
                                 e.stopPropagation();
                                 setModal({ modalShow: true, modalContentType: "preCheck", paramValues: null });
                              }}
                           >
                              <i className="fas fa-plus" />
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
         )}
         {/* ACTION */}
         <div className="section-container my-1">
            <div
               className="section-header d-flex justify-content-between pointer"
               onClick={() => setSectionExpand((prev) => ({ ...prev, action: !prev.action }))}
            >
               <div className="d-flex align-items-center">
                  <span>Actions</span>

                  {isActionCompleted[props.currentStep.name] && props.currentStepDetails.actions.length > 0 ? (
                     <i className="fad fa-check-circle m-2 text-success" />
                  ) : (
                     <>
                        {actionResults[props.currentStep.name] !== undefined &&
                        Object.values(actionResults[props.currentStep.name] || {}).filter((e) => e.success === false).length >
                           0 ? (
                           <i className="fad fa-exclamation-circle m-2 text-danger" />
                        ) : null}
                     </>
                  )}
               </div>

               <div className="d-flex align-items-center">
                  <RunButtonComponent
                     currentRunning={currentRunning.action !== null}
                     workflowHandler={runActionWorkflowHandler}
                     disable={props.currentStepDetails.actions && props.currentStepDetails.actions.length === 0}
                  />
                  {context.mode === "edit" && (
                     <span
                        className="btn btn-xs btn-outline-secondary"
                        onClick={(e) => {
                           e.stopPropagation();
                           setModal({ modalShow: true, modalContentType: "action", paramValues: null });
                        }}
                     >
                        <i className="fas fa-plus" />
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
         {context.mode === "presentation" && context.config.mainContent[props.currentStep.name].postCheck.length === 0 ? null : (
            <div className="section-container my-1">
               <div
                  className="section-header d-flex justify-content-between pointer"
                  onClick={() => setSectionExpand((prev) => ({ ...prev, postCheck: !prev.postCheck }))}
               >
                  <div className="d-flex align-items-center">
                     <span>Post-Check</span>
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
                        disable={props.currentStepDetails.postCheck && props.currentStepDetails.postCheck.length === 0}
                     />
                     {context.mode === "edit" && (
                        <span
                           className="btn btn-xs btn-outline-secondary"
                           onClick={(e) => {
                              e.stopPropagation();
                              setModal({ modalShow: true, modalContentType: "postCheck", paramValues: null });
                           }}
                        >
                           <i className="fas fa-plus" />
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
         )}
         {/* OUTCOME */}
         {!hideOutcomeNameList.includes(props.currentStep.name) && (
            <div className="section-container my-1">
               <div
                  className="section-header d-flex justify-content-between pointer"
                  onClick={() => setSectionExpand((prev) => ({ ...prev, outcome: !prev.outcome }))}
               >
                  <div>
                     <span>Outcome</span>
                     <span className="fw-light mx-5">
                        {props.currentStepDetails.outcome && props.currentStepDetails.outcome[0].summaryText}
                     </span>
                  </div>
                  <div>
                     {context.mode === "edit" && (
                        <>
                           <div className="btn-group btn-group-sm" role="group" aria-label="Small button group">
                              <WithDropdown
                                 className="btn btn-outline-secondary font-sm"
                                 bindToRoot
                                 interactive
                                 placement="left"
                                 DropdownComponent={(close) => (
                                    <CopyDestSelector
                                       source="outcome"
                                       close={close}
                                       onItemClick={(item) => {
                                          dispatch({
                                             type: "copyOutcome",
                                             payload: { fromStep: props.currentStep.name, toStep: item },
                                          });
                                       }}
                                    />
                                 )}
                              >
                                 Copy
                              </WithDropdown>
                              <button
                                 type="button"
                                 className="btn btn-outline-secondary font-sm"
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
                              </button>
                           </div>
                        </>
                     )}
                     <i className={`p-2 fas fa-caret-${sectionExpand.outcome ? "down" : "right"}`}></i>
                  </div>
               </div>
               <Outcome sectionExpand={sectionExpand} currentStepDetails={props.currentStepDetails} />
            </div>
         )}
         {/* MODAL */}
         <Modal
            show={modal.modalShow}
            onHide={() => setModal({ modalShow: false, modalContentType: null, paramValues: null })}
            width="70%"
         >
            <ModalContentSelector
               onHide={() => setModal({ modalShow: false, modalContentType: null, paramValues: null })}
               initValue={modal.paramValues}
               contentType={modal.modalContentType as string}
            />
         </Modal>
         {/* OFFCANVAS */}
         <OffCanvas showOffCanvas={showOffCanvas} setShowOffCanvas={setShowOffCanvas} />
      </>
   );
};

export default DemoContent;

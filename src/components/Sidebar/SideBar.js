import React, { useState, useContext, useEffect, useRef } from "react";
import { Modal } from "../../helper/modalHelper";
import GlobalContext from "../contexts/ContextProvider";
import _ from "lodash";
import MoreOption from "./MoreOption";
import { saveAs } from "file-saver";

const DeleteConfirmation = (props) => {
   const context = useContext(GlobalContext);

   const onDeleteHandler = () => {
      context.deleteStep(props.selectedStep.name);
      props.onHide();
   };

   return (
      <>
         <div className="modal-header">
            <span className="modal-title">Confirm Deletion</span>
            <button type="button" className="btn-close" onClick={props.onHide}></button>
         </div>
         <div className="modal-body">
            Title:{" "}
            <span className="text-danger font-weight-light font-italic">
               {props.selectedStep ? props.selectedStep.label : ""}
            </span>
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

const SideBar = (props) => {
   const context = useContext(GlobalContext);
   const importRef = useRef();
   const [state, setState] = useState({
      activeAddStep: false,
      activeEditMainTitle: false,
      input: "",
      modalShow: false,
      selectedStep: null,
      titleInput: "",
   });

   const clearStateHandler = () => {
      context.setRunningStatus();
      console.log("DEBUG - clear state from sidebar run");
   };

   const isSomeStepRunning = () => {
      for (let i in context.runningStatus) {
         if (context.runningStatus[i] === "running") return true;
      }
      return false;
   };

   const addNewStageHandler = () => {
      context.addStep(state.input);
      setState((prev) => ({ ...prev, activeAddStep: false }));
   };

   const editTitleNameHandler = () => {
      let currentConfig = _.cloneDeep(context.config);
      currentConfig.title = state.titleInput;
      context.updateConfig(currentConfig);
      setState((prev) => ({ ...prev, activeEditMainTitle: false }));
   };

   const exportProjectHandler = () => {
      console.log("export:", context.config);
      let blob = new Blob([JSON.stringify(context.config, null, 2)], { type: "text/plain;charset=utf-8" });
      saveAs(blob, `${context.config.title || "project"}.json`);
   };

   const onFileChange = (event) => {
      event.stopPropagation();
      let file = event.target.files[0];
      console.log(file);
      if (file) {
         const reader = new FileReader();
         // define callback
         reader.onabort = () => console.log("file reading was aborted");
         reader.onerror = () => console.log("file reading has failed");
         reader.onloadend = () => {
            // Do whatever you want with the file contents
            const contentString = reader.result;
            try {
               const config = JSON.parse(contentString);
               // reset currentStep, running Status and clear currentState before load configuration
               context.clearConfig();
               // change config context
               context.updateConfig(config);
               window.localStorage.setItem("configData", contentString);
               importRef.current.value = "";
            } catch (e) {
               console.log(e);
               importRef.current.value = "";
            }
         };
         // read file content
         reader.readAsText(file);
      }
   };

   const renderSiteMenuList = () => {
      return context.config.sidebar.map((element, index) => {
         let statusIcon;
         if (context.runningStatus[element.name] === "success") {
            statusIcon = <i className={"fad ms-2 me-3 fa-circle custom-text-success"} />;
         } else if (context.runningStatus[element.name] === "running") {
            statusIcon = <i className={"fal fa-spinner fa-spin text-light ms-2 me-3"} />;
         } else if (context.runningStatus[element.name] === "fail") {
            statusIcon = <i className={"fad ms-2 me-3 fa-circle custom-text-danger"} />;
         } else {
            statusIcon = (
               <i className={`${context.currentStep.name === element.name ? "fas" : "fal"} ms-2 me-3 fa-circle text-light`} />
            );
         }
         return (
            <div
               key={index}
               className={`side-item mb-3 justify-content-between align-items-center pointer ${
                  isSomeStepRunning() ? "disabled" : ""
               }`}
               style={{ fontSize: "20px" }}
               onClick={() => context.setCurrentStep(element)}
            >
               <div>
                  {statusIcon}
                  <span
                     className={`collapse-icon font-weight-${
                        context.currentStep.name === element.name ? "bold text-light" : "normal"
                     }`}
                  >
                     {element.label}
                  </span>
               </div>
               {context.mode === "edit" && (
                  <i
                     className="far fa-trash fa-sm ms-2 icon-hover-highlight"
                     onClick={(e) => {
                        e.stopPropagation();
                        setState((prev) => ({ ...prev, modalShow: true, selectedStep: element }));
                     }}
                  />
               )}
            </div>
         );
      });
   };

   useEffect(() => {
      context.registerClearStateFunction(clearStateHandler, "sidebar");
      return () => {
         context.unregisterClearStateFunction("sidebar");
      };
   }, []);

   return (
      <>
         <div className="sidenav">
            <div className="sidenav-container">
               {/* ICON */}
               <div
                  className={`text-center text-light p-4 pointer ${isSomeStepRunning() ? "disabled" : ""}`}
                  style={{ fontSize: "20px" }}
                  onClick={() => context.setCurrentStep(context.config.preface ? {} : { ...context.config.sidebar[0] })}
               >
                  {state.activeEditMainTitle ? (
                     <input
                        type="text"
                        value={state.titleInput}
                        onChange={(e) => setState((prev) => ({ ...prev, titleInput: e.target.value }))}
                     />
                  ) : (
                     <span>{context.config.title ? context.config.title : <i className="fal fa-paper-plane" />}</span>
                  )}
                  {context.mode === "edit" && (
                     <div className="font-sm float-right text-hover-highlight">
                        {state.activeEditMainTitle ? (
                           <div onClick={editTitleNameHandler}>done</div>
                        ) : (
                           <div
                              onClick={() =>
                                 setState((prev) => ({ ...prev, activeEditMainTitle: true, titleInput: context.config.title }))
                              }
                           >
                              Edit
                           </div>
                        )}
                     </div>
                  )}
               </div>
               <div style={{ borderBottom: "1px solid #01719c", marginBottom: "1rem" }}></div>
               {/* IMPORT/EXPORT */}

               {/* Content list */}
               {renderSiteMenuList()}
               {state.activeAddStep && (
                  <div className="input-group my-2">
                     <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Name"
                        value={state.input}
                        onChange={(e) => setState((prev) => ({ ...prev, input: e.target.value }))}
                     />
                     <button type="button" className="btn btn-sm btn-info" onClick={addNewStageHandler}>
                        Add
                     </button>
                  </div>
               )}
               {context.mode === "edit" && (
                  <div className="text-center text-light">
                     <i
                        className={`fad fa-${state.activeAddStep ? "minus" : "plus"}-circle pointer font-lg icon-hover-highlight`}
                        onClick={() => setState((prev) => ({ ...prev, activeAddStep: !state.activeAddStep }))}
                     />
                  </div>
               )}
            </div>
            <div className="sidenav-footer">
               <div className="d-flex justify-content-between my-3">
                  <div
                     className="collapse-icon text-light pointer"
                     onClick={() => {
                        if (_.isEmpty(context.config.mainContent.cleanup)) {
                           context.clearStateHandler();
                        } else {
                           context.setCurrentStep({ name: "cleanup", label: "clean up" });
                        }
                     }}
                  >
                     Clean up
                  </div>
                  {context.mode === "edit" && (
                     <div className="d-flex">
                        <div
                           className="px-1 icon-hover-highlight pointer text-light font-sm"
                           onClick={() => importRef.current.click()}
                        >
                           <i className="fal fa-file-import" />
                           {"   "}
                           Import
                           <input
                              id="importFile"
                              type="file"
                              ref={importRef}
                              style={{ display: "none" }}
                              onChange={onFileChange}
                           />
                        </div>
                        <div className="px-1 icon-hover-highlight pointer text-light font-sm" onClick={exportProjectHandler}>
                           <i className="fal fa-download" />
                           {"   "}
                           Export
                        </div>
                     </div>
                  )}
                  <MoreOption />
               </div>
            </div>
         </div>
         <Modal show={state.modalShow} onHide={() => setState((prev) => ({ ...prev, modalShow: false }))}>
            <DeleteConfirmation
               onHide={() => setState((prev) => ({ ...prev, modalShow: false }))}
               selectedStep={state.selectedStep}
            />
         </Modal>
      </>
   );
};
// SideBar.contextType = GlobalContext;

export default SideBar;

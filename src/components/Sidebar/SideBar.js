import React, { useState, useContext, useEffect } from "react";
import { Modal } from "../../helper/modalHelper";
import GlobalContext from "../contexts/ContextProvider";
import _ from "lodash";

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
   const [state, setState] = useState({
      activeAddStep: false,
      input: "",
      modalShow: false,
      selectedStep: null,
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

   const renderSiteMenuList = () => {
      return context.config.sidebar.map((element, index) => {
         let statusIcon;
         if (context.runningStatus[element.name] === "success") {
            statusIcon = (
               <div className={`status-icon text-success ${context.currentStep.name === element.name ? "normal" : ""} `}>
                  <i className="fas fa-check" />
               </div>
            );
         } else if (context.runningStatus[element.name] === "running") {
            statusIcon = (
               <div className={`status-icon text-primary ${context.currentStep.name === element.name ? "normal" : ""} `}>
                  <i className={"fas fa-spinner fa-spin"} />
               </div>
            );
         } else if (context.runningStatus[element.name] === "fail") {
            statusIcon = (
               <div className={`status-icon text-danger ${context.currentStep.name === element.name ? "normal" : ""} `}>
                  <i className="fas fa-times" />
               </div>
            );
         } else {
            statusIcon = (
               <div className={`status-icon s-2 me-3  ${context.currentStep.name === element.name ? "curr-selected" : ""} `}>
                  {`${index + 1}`}
               </div>
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
               <div className="d-flex text-center align-items-center">
                  {statusIcon}
                  <span
                     className={`step-label-text text-nowrap ${isSomeStepRunning() ? "disabled" : ""} ${
                        context.currentStep.name === element.name ? "curr-selected " : ""
                     }`}
                  >
                     {element.label}
                  </span>
               </div>
               {context.mode === "edit" && (
                  <i
                     className="fal fa-trash fa-sm ms-2 icon-hover-highlight"
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
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   return (
      <>
         <div className="sidenav">
            {/* Content list */}
            {renderSiteMenuList()}
            {state.activeAddStep && (
               <div className="d-flex my-3 align-items-center">
                  <input
                     type="text"
                     className="form-control form-control-sm"
                     placeholder="Name"
                     value={state.input}
                     onChange={(e) => setState((prev) => ({ ...prev, input: e.target.value }))}
                  />
                  <span type="button" className=" icon-hover-higlight" onClick={addNewStageHandler}>
                     <i className="far fa-check text-success ms-2" />
                  </span>
               </div>
            )}

            {context.mode === "edit" && (
               <div className="text-center ">
                  <i
                     className={`text-primary fad fa-${
                        state.activeAddStep ? "minus" : "plus"
                     }-circle pointer font-lg icon-hover-highlight`}
                     onClick={() => setState((prev) => ({ ...prev, activeAddStep: !state.activeAddStep }))}
                  />
               </div>
            )}
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

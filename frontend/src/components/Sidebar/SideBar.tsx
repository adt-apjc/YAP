import { useState, useEffect } from "react";
import { Modal } from "../../helper/modalHelper";
import { useGlobalContext } from "../contexts/ContextProvider";

type StepConfig = { name: string; label: string };

type DeleteConfirmationProps = {
   onHide: () => void;
   selectedStep: StepConfig | null;
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
};

const SideBar = () => {
   const { context, dispatch } = useGlobalContext();
   const [state, setState] = useState<SideBarState>({
      activeAddStep: false,
      input: "",
      modalShow: false,
      selectedStep: null,
   });

   const isSomeStepRunning = () => {
      for (let i in context.runningStatus) {
         if (context.runningStatus[i] === "running") return true;
      }
      return false;
   };

   const addNewStageHandler = () => {
      dispatch({ type: "addStep", payload: { name: state.input } });
      setState((prev) => ({ ...prev, activeAddStep: false }));
   };

   const renderSiteMenuList = () => {
      return context.config.sidebar.map((element, index) => {
         let statusIcon;
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
            <div
               key={index}
               className={`d-flex mb-3 justify-content-center justify-content-lg-between pointer ${
                  isSomeStepRunning() ? "disabled" : ""
               }`}
               style={{ fontSize: "20px" }}
               onClick={() => dispatch({ type: "setCurrentStep", payload: element })}
            >
               <div className="d-flex">
                  <div>{statusIcon}</div>
                  <span
                     className={`step-label-text d-none d-md-block ${isSomeStepRunning() ? "disabled" : ""} ${
                        context.currentStep.name === element.name ? "curr-selected " : ""
                     } ${
                        context.runningStatus &&
                        (context.runningStatus[element.name] === "success" || context.runningStatus[element.name] === "fail")
                           ? "bold"
                           : ""
                     }`}
                  >
                     {element.label}
                  </span>
               </div>

               {context.mode === "edit" && (
                  <i
                     title="delete"
                     className={`step-label-text fal fa-trash-alt fa-sm ms-2 icon-hover-highlight d-none d-lg-block ${
                        context.currentStep.name === element.name ? "curr-selected" : ""
                     } ${isSomeStepRunning() ? "disabled" : ""}
                     `}
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
                  <span className=" icon-hover-higlight pointer" onClick={addNewStageHandler}>
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
            <DeleteConfirmation
               onHide={() => setState((prev) => ({ ...prev, modalShow: false }))}
               selectedStep={state.selectedStep}
            />
         </Modal>
      </>
   );
};

export default SideBar;

import React, { useContext } from "react";
import GlobalContext from "../../contexts/ContextProvider";

const ActionDeleteConfirmation = (props) => {
   const context = useContext(GlobalContext);

   const onDeleteHandler = () => {
      context.deleteAction(props.initValue.tab, context.currentStep.name, props.initValue.actionIndex);
      props.onHide();
   };

   return (
      <>
         <div className="modal-header">
            <span className="modal-title">Confirm Deletion</span>
            <button type="button" className="btn-close" onClick={props.onHide}></button>
         </div>
         <div className="modal-body">
            Title: <span className="text-danger font-weight-light font-italic">{props.initValue.action.title}</span>
         </div>
         <div className="modal-footer p-1">
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

export default ActionDeleteConfirmation;

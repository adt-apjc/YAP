import React from "react";
import GlobalContext from "../../contexts/ContextProvider";

class ActionDeleteConfirmation extends React.Component {
   onDeleteHandler = () => {
      const Context = this.context;
      const actionIndex = this.props.initValue.actionIndex;
      Context.deleteAction(this.props.initValue.tab, Context.currentStep.name, actionIndex);
      this.props.onHide();
   };

   render() {
      return (
         <>
            <div className="modal-header">
               <span className="modal-title">Confirm Deletion</span>
               <button type="button" className="btn-close" onClick={this.props.onHide}></button>
            </div>
            <div className="modal-body">
               Title: <span className="text-danger font-weight-light font-italic">{this.props.initValue.action.title}</span>
            </div>
            <div className="modal-footer p-1">
               <button type="button" className="btn btn-sm" onClick={this.props.onHide}>
                  Close
               </button>
               <button type="button" className="btn btn-danger btn-sm" onClick={this.onDeleteHandler}>
                  Delete
               </button>
            </div>
         </>
      );
   }
}
ActionDeleteConfirmation.contextType = GlobalContext;

export default ActionDeleteConfirmation;

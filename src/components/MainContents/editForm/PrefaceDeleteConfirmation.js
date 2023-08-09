import React from "react";
import GlobalContext from "../../contexts/ContextProvider";
import { cloneDeep } from "lodash";

class PrefaceDeleteConfirmation extends React.Component {
   onDeleteHandler = () => {
      let Context = this.context;
      let currentConfig = cloneDeep(Context.config);
      currentConfig.preface = currentConfig.preface.filter((el, index) => index !== this.props.initValue.index);
      Context.updateConfig(currentConfig);
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
               Title: <span className="text-danger font-weight-light font-italic">{this.props.initValue.config.stepDesc}</span>
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
PrefaceDeleteConfirmation.contextType = GlobalContext;

export default PrefaceDeleteConfirmation;

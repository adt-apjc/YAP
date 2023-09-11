import React from "react";
import { useGlobalContext } from "../../contexts/ContextProvider";
import { cloneDeep } from "lodash";

const PrefaceDeleteConfirmation = (props) => {
   let { context, dispatch } = useGlobalContext();

   const onDeleteHandler = () => {
      let currentConfig = cloneDeep(context.config);
      currentConfig.preface = currentConfig.preface.filter((el, index) => index !== props.initValue.index);
      dispatch({ type: "replaceConfig", payload: currentConfig });
      props.onHide();
   };

   return (
      <>
         <div className="modal-header">
            <span className="modal-title">Confirm Deletion</span>
            <button type="button" className="btn-close" onClick={props.onHide}></button>
         </div>
         <div className="modal-body">
            Title: <span className="text-danger font-weight-light font-italic">{props.initValue.config.stepDesc}</span>
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

export default PrefaceDeleteConfirmation;

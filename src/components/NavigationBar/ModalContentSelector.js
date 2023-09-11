import React from "react";
import Endpoint from "./Settings/Endpoint";
import GlobalVariable from "./Settings/GlobalVariable";

const Settings = (props) => {
   return (
      <>
         <div className="modal-header">
            <span className="modal-title">Settings</span>
            <button type="button" className="btn-close" onClick={props.onHide}></button>
         </div>
         <div className="modal-body">
            <Endpoint />
            <GlobalVariable />
         </div>
         <div className="modal-footer">
            <button type="button" className="btn btn-sm btn-danger" onClick={props.onHide}>
               Close
            </button>
         </div>
      </>
   );
};

const ModalContentSelector = (props) => {
   let { contentType } = props;
   if (contentType === "settings") {
      return <Settings {...props} />;
   } else {
      return null;
   }
};

export default ModalContentSelector;

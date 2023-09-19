import Endpoint from "./Settings/Endpoint";
import StaticVariables from "./Settings/StaticVariables";

const Settings = (props: { onHide: () => any }) => {
   return (
      <>
         <div className="modal-header">
            <span className="modal-title">Settings</span>
            <button type="button" className="btn-close" onClick={props.onHide}></button>
         </div>
         <div className="modal-body">
            <Endpoint />
            <StaticVariables />
         </div>
         <div className="modal-footer">
            <button type="button" className="btn btn-sm btn-danger" onClick={props.onHide}>
               Close
            </button>
         </div>
      </>
   );
};

const ModalContentSelector = (props: { contentType: string; onHide: () => any }) => {
   let { contentType } = props;
   if (contentType === "settings") {
      return <Settings onHide={props.onHide} />;
   } else {
      return null;
   }
};

export default ModalContentSelector;

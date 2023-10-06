import { useState } from "react";
import { saveAs } from "file-saver";
import { useGlobalContext } from "../contexts/ContextProvider";

import Endpoint from "./Settings/Endpoint";
import StaticVariables from "./Settings/StaticVariables";
import _ from "lodash";

type ModalSelctorProps = { contentType: string; onHide: () => any };

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

const ExportConfig = (props: { onHide: () => any }) => {
   const { context } = useGlobalContext();
   const [demoVersion, setDemoVersion] = useState(context.config.demoVersion || "1.0.0");

   const handleExport = () => {
      let config = _.cloneDeep(context.config);
      config.demoVersion = demoVersion;
      let blob = new Blob([JSON.stringify(config, null, 2)], { type: "text/plain;charset=utf-8" });
      saveAs(blob, `${config.title || "project"}.json`);
      console.log("export:", config);
      props.onHide();
   };

   return (
      <>
         <div className="modal-header">
            <span className="modal-title">Export to JSON</span>
            <button type="button" className="btn-close" onClick={props.onHide}></button>
         </div>
         <div className="modal-body">
            <label>Demo version</label>
            <input
               type="text"
               className="form-control form-control-sm"
               value={demoVersion}
               onChange={(e) => setDemoVersion(e.target.value)}
            />
         </div>
         <div className="modal-footer">
            <button type="button" className="btn btn-sm" onClick={props.onHide}>
               Close
            </button>
            <button type="button" className="btn btn-sm btn-primary" onClick={handleExport}>
               Export
            </button>
         </div>
      </>
   );
};

const ModalContentSelector = (props: ModalSelctorProps) => {
   let { contentType } = props;
   if (contentType === "settings") {
      return <Settings onHide={props.onHide} />;
   } else if (contentType === "export") {
      return <ExportConfig onHide={props.onHide} />;
   } else {
      return null;
   }
};

export default ModalContentSelector;

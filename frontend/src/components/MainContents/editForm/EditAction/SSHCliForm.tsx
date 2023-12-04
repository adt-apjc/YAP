import React, { useEffect, useState } from "react";
import { useGlobalContext } from "../../../contexts/ContextProvider";
import { SSHCliFormProps } from "./EditAction";
import { SSHActionConfig } from "../../../contexts/ContextTypes";
import AceEditor from "react-ace";

import "ace-builds/webpack-resolver";
import "ace-builds/src-noconflict/mode-text";
import "ace-builds/src-noconflict/theme-github";
import _ from "lodash";

const SSHCliForm = (props: SSHCliFormProps) => {
   const { context, dispatch } = useGlobalContext();
   const [input, setInput] = useState<SSHActionConfig>({
      type: "ssh-cli",
      useEndpoint: "",
      apiBadge: "",
      apiBadgeColor: "",
      title: "",
      description: "",
      displayResponseAs: "text",
      payloadType: "text",
      expect: [],
      match: undefined,
      data: "",
   });

   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setInput((prev) => ({ ...prev, [e.target.name]: e.target.value }));
   };

   const renderEndpointOptions = () => {
      if (!context.config.endpoints) return;

      let endpoints = Object.keys(context.config.commandEndpoints);
      return endpoints.map((el, index) => {
         return (
            <option key={index} value={el}>
               {el}
            </option>
         );
      });
   };

   return (
      <form>
         <div className="row mb-2">
            <div className="col-6">
               <small className="mb-1">Endpoint</small>
               {/* <select className="form-select form-select-sm" name="useEndpoint" required>
                  <option value="">Choose endpoint...</option>
                  <option value="mock-1">mock-1</option>
                  <option value="mock-2">mock-2</option>
               </select> */}
               <select
                  className="form-select form-select-sm"
                  name="useEndpoint"
                  onChange={handleInputChange}
                  value={input.useEndpoint}
                  required
               >
                  <option value="">Choose endpoint...</option>
                  {renderEndpointOptions()}
               </select>
            </div>
         </div>
         <div className="row mb-2">
            <div className="col-sm-3">
               <small className="mb-1">Badge</small>
               <input type="text" className="form-control form-control-sm" name="apiBadge" placeholder="Badge Text" required />
            </div>
            <div className="col-sm-2">
               <small className="mb-1">Badge Color</small>
               <input type="text" className="form-control form-control-sm" name="apiBadgeColor" placeholder="Badge Color" />
            </div>
            <div className="col">
               <small className="mb-1">Title Text</small>
               <input type="text" className="form-control form-control-sm" name="title" placeholder="title text" required />
            </div>
         </div>
         <div className="row mb-2">
            <div className="col">
               <small>Description</small>
               <textarea className="form-control form-control-sm" name="description" placeholder="Description" />
            </div>
         </div>
         <span className="me-2 font-sm">CLI Commands</span>
         <AceEditor
            mode="text"
            theme="github"
            height="300px"
            width="100%"
            // value={dataText}
            // onChange={setDataText}
            name="data"
            className="rounded border"
            editorProps={{ $blockScrolling: true }}
            showPrintMargin={false}
         />
      </form>
   );
};

export default SSHCliForm;

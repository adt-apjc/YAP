import React, { useEffect, useState } from "react";
import { useGlobalContext } from "../../../contexts/ContextProvider";
import { SSHCliFormProps } from "./EditAction";
import { ActionExpectObject, ActionMatchObject, SSHActionConfig } from "../../../contexts/ContextTypes";
import AceEditor from "react-ace";
import ExpectForm from "./ExpectForm";
import VariableForm from "./VariableForm";

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

   const setExpect = (val: ActionExpectObject) => {
      setInput((prev) => ({ ...prev, expect: val }));
   };

   const setDataText = (val: string) => {
      setInput((prev) => ({ ...prev, data: val }));
   };

   const setMatchObject = (val: ActionMatchObject | undefined) => {
      if (!val) {
         setInput((prev) => ({ ...prev, match: undefined }));
         return;
      }
      setInput((prev) => ({ ...prev, match: val }));
   };

   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setInput((prev) => ({ ...prev, [e.target.name]: e.target.value }));
   };

   const handleFormSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      const { initValue } = props;
      const actionIndex = initValue ? initValue.actionIndex : null;
      let inputCloned = _.cloneDeep(input);

      dispatch({
         type: "addAction",
         payload: { stepKey: context.currentStep.name!, tab: props.tab, index: actionIndex, actionObject: inputCloned },
      });
      props.onHide();
   };

   const renderEndpointOptions = () => {
      if (!context.config.commandEndpoints) return;

      let endpoints = Object.keys(context.config.commandEndpoints);
      return endpoints.map((el, index) => {
         return (
            <option key={index} value={el}>
               {el}
            </option>
         );
      });
   };

   useEffect(() => {
      setInput((prev) => {
         if (!props.initValue) return prev;
         return { ...prev, ...props.initValue.action };
      });
   }, [props.initValue]);

   return (
      <form id="actionForm" onSubmit={handleFormSubmit}>
         <div className="row mb-2">
            <div className="col-6">
               <small className="mb-1">Endpoint</small>
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
               <input
                  type="text"
                  className="form-control form-control-sm"
                  name="apiBadge"
                  placeholder="Optional Badge Text"
                  value={input.apiBadge}
                  onChange={handleInputChange}
               />
            </div>
            <div className="col-sm-2">
               <small className="mb-1">Optional Color</small>
               <input
                  type="text"
                  className="form-control form-control-sm"
                  name="apiBadgeColor"
                  placeholder="Optional Color"
                  value={input.apiBadgeColor}
                  onChange={handleInputChange}
               />
            </div>
            <div className="col">
               <small className="mb-1">Title Text</small>
               <input
                  type="text"
                  className="form-control form-control-sm"
                  name="title"
                  placeholder="title text"
                  value={input.title}
                  onChange={handleInputChange}
                  required
               />
            </div>
         </div>
         <div className="row mb-2">
            <div className="col">
               <small>Description</small>
               <textarea
                  className="form-control form-control-sm"
                  name="description"
                  placeholder="Description"
                  value={input.description}
                  onChange={handleInputChange}
               />
            </div>
         </div>
         <ExpectForm expect={input.expect!} setExpect={setExpect} input={input} />
         <VariableForm match={input.match} setMatch={setMatchObject} input={input} />
         <span className="me-2 font-sm">CLI Commands</span>
         <AceEditor
            mode="text"
            theme="github"
            height="300px"
            width="100%"
            value={input.data}
            onChange={setDataText}
            name="data"
            className="rounded border"
            editorProps={{ $blockScrolling: true }}
            showPrintMargin={false}
         />
      </form>
   );
};

export default SSHCliForm;

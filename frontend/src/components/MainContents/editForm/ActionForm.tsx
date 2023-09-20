import React, { useEffect, useState } from "react";
import { useGlobalContext } from "../../contexts/ContextProvider";
import AceEditor from "react-ace";
import _ from "lodash";
import "ace-builds/webpack-resolver";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/mode-text";
import "ace-builds/src-noconflict/theme-github";
import { ActionExpectObject, ActionMatchObject, ActionConfig, ActionConfigPayloadObject } from "../../contexts/ContextTypes";

type ConfigPayloadProps = {
   configurePayload: ActionConfigPayloadObject | undefined;
   setConfigPayload: (c: ActionConfigPayloadObject | undefined) => void;
   input: ActionConfig;
   onChangeHandler: (e: any) => void;
};

type ActionFormProps = {
   onHide: () => void;
   initValue: { action: ActionConfig; actionIndex: number } | null;
   tab: "preCheck" | "actions" | "postCheck";
};

type VariableFormProps = {
   match: ActionMatchObject | undefined;
   setMatch: (m: ActionMatchObject | undefined) => void;
   input: ActionConfig;
};

type ExpectFormProps = {
   expect: ActionExpectObject;
   setExpect: (e: ActionExpectObject) => void;
};

const ConfigPayloadForm = (props: ConfigPayloadProps) => {
   return (
      <>
         <div className="row mb-2">
            <div className="col-sm-12 col-md-2">DisplayRequestAs</div>
            <div className="col-sm-12 col-md-3">
               <select
                  className="form-select form-select-sm"
                  name="displayRequestAs"
                  value={props.configurePayload ? props.configurePayload.displayRequestAs : ""}
                  onChange={(e) => props.setConfigPayload({ ...props.configurePayload!, [e.target.name]: e.target.value })}
               >
                  <option value="json">JSON</option>
                  <option value="text">PLAIN TEXT</option>
               </select>
            </div>
         </div>
         <div className="row mb-2">
            <div className="col-sm-12 col-md-2">DisplayResponseAs</div>
            <div className="col-sm-12 col-md-3">
               <select
                  className="form-select form-select-sm"
                  name="displayResponseAs"
                  value={props.configurePayload ? props.configurePayload.displayResponseAs : ""}
                  onChange={(e) => props.setConfigPayload({ ...props.configurePayload!, [e.target.name]: e.target.value })}
               >
                  <option value="json">JSON</option>
                  <option value="text">PLAIN TEXT</option>
               </select>
            </div>
            {props.input.configurePayload && props.input.configurePayload.displayResponseAs === "text" && (
               <div className="col-sm-12 col-md-3">
                  <input
                     type="text"
                     className="form-control form-control-sm"
                     name="objectPath"
                     placeholder="objectPath"
                     value={props.input.objectPath}
                     onChange={(e) => props.onChangeHandler(e)}
                  />
               </div>
            )}
         </div>
      </>
   );
};

const ExpectForm = (props: ExpectFormProps) => {
   const [isExpectEnable, setIsExpectEnable] = useState(false);

   const handleExpectTypeChange = (e: React.ChangeEvent<HTMLSelectElement>, index: number) => {
      let currentExpect = _.cloneDeep(props.expect);
      currentExpect[index].type = e.target.value;
      currentExpect[index].value = e.target.value === "codeIs" ? [] : "";
      props.setExpect(currentExpect);
   };

   const handleExpectValueChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
      let currentExpect = _.cloneDeep(props.expect);
      currentExpect[index].value =
         currentExpect[index].type === "codeIs" ? e.target.value.split(",").map((el) => el.trim()) : e.target.value;
      props.setExpect(currentExpect);
   };

   const handleExpectEnableChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.checked) props.setExpect([]);
      setIsExpectEnable(e.target.checked);
   };

   const handleExpectFormDelete = (index: number) => {
      const newExpectList = props.expect.filter((el, i) => i !== index);
      props.setExpect(newExpectList);
   };

   const renderExpectForm = () => {
      return (
         props.expect &&
         props.expect.map((el, index) => {
            return (
               <div key={index} className="row mb-2">
                  <div className="col-3">
                     <select
                        className="form-select form-select-sm"
                        name="type"
                        value={props.expect[index].type}
                        onChange={(e) => handleExpectTypeChange(e, index)}
                     >
                        <option value="bodyContain">bodyContain</option>
                        <option value="bodyNotContain">bodyNotContain</option>
                        <option value="codeIs">HttpResponseCodeIs</option>
                     </select>
                  </div>
                  <div className="col-7">
                     <input
                        className="form-control form-control-sm"
                        type="text"
                        name="value"
                        required
                        value={props.expect[index].value}
                        onChange={(e) => handleExpectValueChange(e, index)}
                     />
                  </div>
                  <div className="col-2">
                     <i
                        className="fal fa-times text-danger icon-hover-highlight pointer"
                        onClick={() => handleExpectFormDelete(index)}
                     />
                  </div>
               </div>
            );
         })
      );
   };

   useEffect(() => {
      if (props.expect && props.expect.length > 0) setIsExpectEnable(true);
   }, [props.expect]);

   return (
      <>
         <div className="form-check">
            <input
               type="checkbox"
               className="form-check-input"
               id="enableExpectCheckBox"
               checked={isExpectEnable}
               onChange={handleExpectEnableChange}
            />
            <label className="form-check-label" htmlFor="enableExpectCheckBox">
               Enable expect
            </label>
         </div>
         {isExpectEnable ? (
            <div>
               {renderExpectForm()}
               <div className="w-100 text-center">
                  <i
                     className="fad fa-plus text-info icon-hover-highlight pointer"
                     onClick={() => props.setExpect([...props.expect, { type: "bodyContain", value: "" }])}
                  />
               </div>
            </div>
         ) : null}
      </>
   );
};

const VariableForm = (props: VariableFormProps) => {
   const [isEnable, setIsEnable] = useState(false);

   const handleExpectEnableChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setIsEnable(e.target.checked);
      if (!e.target.checked) props.setMatch(undefined);
      else props.setMatch({ regEx: ".*", matchGroup: "0", storeAs: "", objectPath: "" });
   };

   useEffect(() => {
      if (props.match) setIsEnable(true);
   }, [props.match]);

   useEffect(() => {
      if (props.input.configurePayload?.displayResponseAs === "text") {
         props.setMatch({ ...props.match!, regEx: "", matchGroup: "", objectPath: "" });
      } else {
         props.setMatch({ regEx: ".*", matchGroup: "0", storeAs: "", objectPath: "" });
      }
   }, [props.input.configurePayload]);

   return (
      <>
         <div className="form-check">
            <input
               type="checkbox"
               className="form-check-input"
               id="enableVarCheckBox"
               checked={isEnable}
               onChange={handleExpectEnableChange}
            />
            <label className="form-check-label" htmlFor="enableVarCheckBox">
               Variable
            </label>
         </div>
         {isEnable ? (
            <div className="row mb-2">
               <div className="col-md-3">
                  <small className="mb-1">Object path</small>
                  <input
                     className="form-control form-control-sm"
                     type="text"
                     name="objectPath"
                     required={
                        props.input.configurePayload && props.input.configurePayload.displayRequestAs === "text" ? false : true
                     }
                     value={props.match ? props.match.objectPath : ""}
                     onChange={(e) => props.setMatch({ ...props.match!, [e.target.name]: e.target.value })}
                     disabled={props.input.configurePayload?.displayResponseAs === "text"}
                  />
               </div>
               <div className="col-md-3">
                  <small className="mb-1">RegEx.</small>
                  <input
                     className="form-control form-control-sm"
                     type="text"
                     name="regEx"
                     required={
                        props.input.configurePayload && props.input.configurePayload.displayRequestAs === "text" ? false : true
                     }
                     value={props.match ? props.match.regEx : ""}
                     onChange={(e) => props.setMatch({ ...props.match!, [e.target.name]: e.target.value })}
                     disabled={props.input.configurePayload?.displayResponseAs === "text"}
                  />
               </div>
               <div className="col-md-3">
                  <small className="mb-1">Variable name</small>
                  <input
                     className="form-control form-control-sm"
                     type="text"
                     name="storeAs"
                     required
                     value={props.match ? props.match.storeAs : ""}
                     onChange={(e) => props.setMatch({ ...props.match!, [e.target.name]: e.target.value })}
                  />
               </div>
               <div className="col-md-3">
                  <small className="mb-1">Match group</small>
                  <input
                     className="form-control form-control-sm"
                     type="number"
                     name="matchGroup"
                     required={
                        props.input.configurePayload && props.input.configurePayload.displayRequestAs === "text" ? false : true
                     }
                     value={props.match ? props.match.matchGroup : 0}
                     onChange={(e) => props.setMatch({ ...props.match!, [e.target.name]: parseInt(e.target.value) })}
                     disabled={props.input.configurePayload?.displayResponseAs === "text"}
                  />
               </div>
            </div>
         ) : null}
      </>
   );
};

const ActionForm = (props: ActionFormProps) => {
   const { context, dispatch } = useGlobalContext();
   const [input, setInput] = useState<ActionConfig>({
      type: "request",
      useEndpoint: "",
      headers: undefined,
      apiBadge: "",
      apiBadgeColor: "",
      title: "",
      description: "",
      url: "",
      method: "get",
      configurePayload: undefined,
      objectPath: "",
      expect: [],
      data: undefined,
      maxRetry: "10",
      interval: "1000",
      match: undefined,
   });
   const [isPayloadValid, setIsPayloadValid] = useState(true);

   const setConfigPayload = (val: ActionConfigPayloadObject | undefined) => {
      if (!val) {
         setInput((prev) => ({ ...prev, configurePayload: undefined }));
         return;
      }
      setInput((prev) => ({ ...prev, configurePayload: val }));
   };

   const setExpect = (val: ActionExpectObject) => {
      setInput((prev) => ({ ...prev, expect: val }));
   };

   const setMatchObject = (val: ActionMatchObject | undefined) => {
      if (!val) {
         setInput((prev) => ({ ...prev, match: undefined }));
         return;
      }
      setInput((prev) => ({ ...prev, match: val }));
   };

   const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setInput((prev) => ({ ...prev, [e.target.name]: e.target.value }));
   };

   const handleFormSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!isPayloadValid) return;

      const { initValue } = props;
      const actionIndex = initValue ? initValue.actionIndex : null;
      let inputCloned = _.cloneDeep(input);
      if (inputCloned.type === "request") {
         inputCloned.maxRetry = undefined;
         inputCloned.interval = undefined;
      }
      if (inputCloned.displayResponseAs === "json") inputCloned.objectPath = undefined;

      dispatch({
         type: "addAction",
         payload: { stepKey: context.currentStep.name!, tab: props.tab, index: actionIndex, actionObject: inputCloned },
      });
      props.onHide();
   };

   const handlePayloadChange = (value: string) => {
      if (value === "") {
         setInput({ ...input, data: undefined });
         setIsPayloadValid(true);
         return;
      }

      try {
         let data =
            input.configurePayload?.displayRequestAs === "text"
               ? `${typeof value === "string" ? value : JSON.stringify(value)}`
               : JSON.parse(value);
         setInput({ ...input, data });
         setIsPayloadValid(true);
      } catch (e) {
         setIsPayloadValid(false);
      }
   };

   const renderEndpointOptions = () => {
      if (!context.config.endpoints) return;

      let endpoints = Object.keys(context.config.endpoints);
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
      <>
         <div className="modal-header">
            <span className="modal-title">
               {props.initValue ? "Edit" : "Add"} {props.tab}
            </span>
            <button type="button" className="btn-close" onClick={props.onHide}></button>
         </div>
         <div className="modal-body">
            <form id="actionForm" onSubmit={handleFormSubmit}>
               <div className="row align-items-center">
                  <div className="col-3">
                     <div className="form-check form-check-inline">
                        <input
                           className="form-check-input"
                           type="radio"
                           name="type"
                           id="inlineRadio1"
                           value="request"
                           checked={input.type === "request"}
                           onChange={onChangeHandler}
                        />
                        <label className="form-check-label" htmlFor="inlineRadio1">
                           request
                        </label>
                     </div>
                     <div className="form-check form-check-inline">
                        <input
                           className="form-check-input"
                           type="radio"
                           name="type"
                           id="inlineRadio2"
                           value="polling"
                           checked={input.type === "polling"}
                           onChange={onChangeHandler}
                        />
                        <label className="form-check-label" htmlFor="inlineRadio2">
                           polling
                        </label>
                     </div>
                  </div>
                  <div className="col-9">
                     <div className="row">
                        <div className={`${input.type === "polling" ? "col-3" : "form-check form-check-inline"}`}>
                           <div className="col">
                              <small className="mb-1">Endpoint</small>
                              <select
                                 className="form-select form-select-sm"
                                 name="useEndpoint"
                                 onChange={onChangeHandler}
                                 value={input.useEndpoint}
                                 required
                              >
                                 <option value="">Choose endpoint...</option>
                                 {renderEndpointOptions()}
                              </select>
                           </div>
                        </div>
                        <div className="col-9">
                           {input.type === "polling" ? (
                              <>
                                 <div className="row">
                                    <div className="col-6">
                                       <small className="mb-1">Max Retry</small>
                                       <input
                                          type="number"
                                          className="form-control form-control-sm"
                                          name="maxRetry"
                                          placeholder="maxRetry default = 10"
                                          value={input.maxRetry}
                                          onChange={onChangeHandler}
                                       />
                                    </div>
                                    <div className="col-6">
                                       <small className="mb-1">Interval</small>
                                       <input
                                          type="number"
                                          className="form-control form-control-sm"
                                          name="interval"
                                          placeholder="Interval default = 5000ms"
                                          value={input.interval}
                                          onChange={onChangeHandler}
                                       />
                                    </div>
                                 </div>
                              </>
                           ) : null}
                        </div>
                     </div>
                  </div>
               </div>
               <div className="input-group my-2">
                  <select
                     style={{ maxWidth: 150 }}
                     className="form-select form-select-sm"
                     name="method"
                     value={input.method}
                     onChange={onChangeHandler}
                  >
                     <option value="get">GET</option>
                     <option value="post">POST</option>
                     <option value="put">PUT</option>
                     <option value="patch">PATCH</option>
                     <option value="delete">DELETE</option>
                  </select>
                  <input
                     type="text"
                     className="form-control"
                     name="url"
                     placeholder="Enter request URL (ex. /your/path)"
                     required
                     value={input.url}
                     onChange={onChangeHandler}
                  />
               </div>
               <div className="row mb-2">
                  <div className="col-sm-3">
                     <small className="mb-1">API Badge</small>
                     <input
                        type="text"
                        className="form-control form-control-sm"
                        name="header"
                        placeholder="Header text"
                        value={input.apiBadge}
                        onChange={onChangeHandler}
                        required
                     />
                  </div>
                  <div className="col-sm-2">
                     <small className="mb-1">API Badge Color</small>
                     <input
                        type="text"
                        className="form-control form-control-sm"
                        name="headerColor"
                        placeholder="Header color"
                        value={input.apiBadgeColor}
                        onChange={onChangeHandler}
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
                        onChange={onChangeHandler}
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
                        onChange={onChangeHandler}
                     />
                  </div>
               </div>

               <ConfigPayloadForm
                  configurePayload={input.configurePayload}
                  setConfigPayload={setConfigPayload}
                  input={input}
                  onChangeHandler={onChangeHandler}
               />
               <ExpectForm expect={input.expect!} setExpect={setExpect} />
               <VariableForm match={input.match} setMatch={setMatchObject} input={input} />
               <div className="row">
                  <div className="col">
                     <div>
                        <span className="me-2 font-sm">Payload (optional)</span>
                        {!isPayloadValid ? "invalid JSON" : ""}
                     </div>
                     <AceEditor
                        mode={input.configurePayload?.displayRequestAs === "text" ? "text" : "json"}
                        theme="github"
                        height="300px"
                        width="100%"
                        value={
                           input.configurePayload?.displayRequestAs === "text" && typeof input.data === "string"
                              ? `${input.data === undefined ? "" : input.data}`
                              : JSON.stringify(input.data, null, 4)
                        }
                        onChange={handlePayloadChange}
                        name="data"
                        className="rounded border"
                        editorProps={{ $blockScrolling: true }}
                        showPrintMargin={false}
                     />
                  </div>
               </div>
            </form>
         </div>
         <div className="modal-footer p-1">
            <button type="button" className="btn btn-sm" onClick={props.onHide}>
               Close
            </button>
            <button type="submit" className="btn btn-primary btn-sm" form="actionForm">
               {props.initValue ? "Update" : "Add"}
            </button>
         </div>
      </>
   );
};

export default ActionForm;

import React, { useEffect, useState } from "react";
import { useGlobalContext } from "../../contexts/ContextProvider";
import AceEditor from "react-ace";
import _ from "lodash";
import "ace-builds/webpack-resolver";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/mode-text";
import "ace-builds/src-noconflict/theme-github";
import { ActionExpectObject, ActionMatchObject, ActionConfig } from "../../contexts/ContextTypes";
import WithDropdown from "../../Popper/Dropdown";

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

type PayloadTypeSelectorProps = {
   payloadType: string;
   setPayloadType: (v: string) => void;
};

type HeaderFormInput = { key: string; value: string };

type HeadersFormProps = {
   input: ActionConfig;
   inputHeaders: HeaderFormInput[];
   setInputHeaders: React.Dispatch<React.SetStateAction<HeaderFormInput[]>>;
};

const HeadersForm = (props: HeadersFormProps) => {
   const onHeaderChangeHandler = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
      let currentHeaders = props.inputHeaders;
      currentHeaders[index] = { ...currentHeaders[index], [e.target.name]: e.target.value };
      props.setInputHeaders([...currentHeaders]);
   };

   const onHeaderDeleteHandler = (index: number) => {
      let currentHeader = props.inputHeaders.filter((el, i) => i !== index);
      props.setInputHeaders(currentHeader);
   };

   const onHeaderAddHandler = () => {
      let currentInputHeaders = _.cloneDeep(props.inputHeaders);
      currentInputHeaders.push({ key: "", value: "" });
      props.setInputHeaders(currentInputHeaders);
   };

   const renderHeaderField = () => {
      return props.inputHeaders.map((el, index) => {
         return (
            <React.Fragment key={index}>
               <div className="col-11">
                  <div className="input-group" style={{ marginTop: "-1px" }}>
                     <input
                        type="text"
                        className="form-control form-control-sm"
                        name="key"
                        placeholder="key"
                        required
                        value={el.key}
                        onChange={(e) => onHeaderChangeHandler(e, index)}
                     />
                     <input
                        type="text"
                        className="form-control form-control-sm"
                        name="value"
                        placeholder="value"
                        required
                        value={el.value}
                        onChange={(e) => onHeaderChangeHandler(e, index)}
                     />
                  </div>
               </div>
               <div className="col-1">
                  <span className="pointer" onClick={() => onHeaderDeleteHandler(index)}>
                     {"\u00D7"}
                  </span>
               </div>
            </React.Fragment>
         );
      });
   };

   useEffect(() => {
      if (!props.input) return;

      let inputHeaders = [];
      for (let item in props.input.headers) {
         inputHeaders.push({ key: item, value: props.input.headers[item] });
      }
      props.setInputHeaders(inputHeaders);
   }, [props.input.headers]);

   return (
      <div>
         <div className="row">{renderHeaderField()}</div>
         <div className="text-center text-info font-lg">
            <i className="fad fa-plus-circle icon-hover-highlight pointer" onClick={onHeaderAddHandler} />
         </div>
      </div>
   );
};

const PayloadTypeSelector = (props: PayloadTypeSelectorProps) => {
   const [isMenuOpen, setIsMenuOpen] = useState(false);

   const handleSelect = (val: string) => {
      props.setPayloadType(val);
      setIsMenuOpen(false);
   };

   const SelectComponent = (
      <div className="font-sm">
         <ul className="list-group border border-0">
            <li className="list-group-item list-group-item-action pointer" onClick={() => handleSelect("json")}>
               JSON
            </li>
            <li className="list-group-item list-group-item-action pointer" onClick={() => handleSelect("text")}>
               Text
            </li>
         </ul>
      </div>
   );

   return (
      <WithDropdown
         interactive
         open={isMenuOpen}
         onRequestClose={() => setIsMenuOpen(false)}
         placement="top"
         DropdownComponent={SelectComponent}
      >
         <div className="font-sm" onClick={() => setIsMenuOpen(true)}>
            <span className="me-2">{props.payloadType.toLocaleUpperCase()}</span>
            <i className="fas fa-caret-up" />
         </div>
      </WithDropdown>
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
      if (props.input.displayResponseAs === "text") {
         if (props.match) props.setMatch({ regEx: ".*", matchGroup: "0", storeAs: props.match.storeAs, objectPath: "" });
      }
   }, [props.input.displayResponseAs]);

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
                     required={props.input.payloadType === "text" ? false : true}
                     value={props.match ? props.match.objectPath : ""}
                     onChange={(e) => props.setMatch({ ...props.match!, [e.target.name]: e.target.value })}
                     disabled={props.input.displayResponseAs === "text"}
                  />
               </div>
               <div className="col-md-3">
                  <small className="mb-1">RegEx.</small>
                  <input
                     className="form-control form-control-sm"
                     type="text"
                     name="regEx"
                     required
                     value={props.match ? props.match.regEx : ""}
                     onChange={(e) => props.setMatch({ ...props.match!, [e.target.name]: e.target.value })}
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
                     required
                     value={props.match ? props.match.matchGroup : 0}
                     onChange={(e) => props.setMatch({ ...props.match!, [e.target.name]: parseInt(e.target.value) })}
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
      displayResponseAs: "json",
      payloadType: "json",
      objectPath: "",
      expect: [],
      maxRetry: "10",
      interval: "1000",
      match: undefined,
   });

   const [dataText, setDataText] = useState("");
   const [inputHeaders, setInputHeaders] = useState<HeaderFormInput[]>([]);
   const [isHeadersEnabled, setIsHeadersEnabled] = useState(false);

   const handleHeadersEnableChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.checked) setInputHeaders([]);
      setIsHeadersEnabled(e.target.checked);
   };

   const transformPayloadTextToObject = () => {
      try {
         if (dataText === "") return undefined;
         let obj = JSON.parse(dataText);
         return obj;
      } catch (err) {
         return false;
      }
   };

   const setExpect = (val: ActionExpectObject) => {
      setInput((prev) => ({ ...prev, expect: val }));
   };

   const setPayloadType = (val: string) => {
      setInput((prev) => ({ ...prev, payloadType: val }));
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

   const generateHeaders = () => {
      if (inputHeaders.length === 0) return undefined;

      let headers: { [key: string]: string } = {};
      for (let item of inputHeaders) {
         headers[item.key] = item.value;
      }

      return headers;
   };

   const handleFormSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      const { initValue } = props;
      const actionIndex = initValue ? initValue.actionIndex : null;
      let inputCloned = _.cloneDeep(input);
      if (inputCloned.type === "request") {
         inputCloned.maxRetry = undefined;
         inputCloned.interval = undefined;
         inputCloned.headers = generateHeaders();
      }
      if (inputCloned.displayResponseAs === "json") inputCloned.objectPath = undefined;

      let payload: any;
      if (inputCloned.payloadType === "text") payload = dataText;
      else payload = transformPayloadTextToObject();
      if (payload !== false) {
         inputCloned.data = payload;
         dispatch({
            type: "addAction",
            payload: { stepKey: context.currentStep.name!, tab: props.tab, index: actionIndex, actionObject: inputCloned },
         });
         props.onHide();
      }
   };
   const handleBeautify = () => {
      let payload = transformPayloadTextToObject();
      if (payload) setDataText(JSON.stringify(payload, null, 3));
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

         if (props.initValue.action.headers && Object.keys(props.initValue.action.headers).length > 0) setIsHeadersEnabled(true);

         if (props.initValue.action.data)
            setDataText(
               typeof props.initValue.action.data === "string"
                  ? props.initValue.action.data
                  : JSON.stringify(props.initValue.action.data, null, 3)
            );
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
               <div className="row align-items-center mb-3">
                  <div className="col-3">
                     <div className="form-check form-check-inline">
                        <input
                           className="form-check-input"
                           type="radio"
                           name="type"
                           id="inlineRadio1"
                           value="request"
                           checked={input.type === "request"}
                           onChange={handleInputChange}
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
                           onChange={handleInputChange}
                        />
                        <label className="form-check-label" htmlFor="inlineRadio2">
                           polling
                        </label>
                     </div>
                  </div>
                  <div className="col-7">
                     <div className="row">
                        <div className={`${input.type === "polling" ? "col-3" : "form-check form-check-inline"}`}>
                           <div className="col">
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
                                          onChange={handleInputChange}
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
                                          onChange={handleInputChange}
                                       />
                                    </div>
                                 </div>
                              </>
                           ) : null}
                        </div>
                     </div>
                  </div>
                  <div className="col-2 align-items-center mt-4">
                     <div className="form-check ">
                        <input
                           type="checkbox"
                           className="form-check-input"
                           id="enableHeaders"
                           checked={isHeadersEnabled}
                           onChange={handleHeadersEnableChange}
                        />
                        <label className="form-check-label" htmlFor="enableHeaders">
                           Override Headers
                        </label>
                     </div>
                  </div>
               </div>

               {isHeadersEnabled && <HeadersForm input={input} inputHeaders={inputHeaders} setInputHeaders={setInputHeaders} />}

               <div className="input-group my-2">
                  <select
                     style={{ maxWidth: 150 }}
                     className="form-select form-select-sm"
                     name="method"
                     value={input.method}
                     onChange={handleInputChange}
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
                     onChange={handleInputChange}
                  />
               </div>
               <div className="row mb-2">
                  <div className="col-sm-3">
                     <small className="mb-1">API Badge</small>
                     <input
                        type="text"
                        className="form-control form-control-sm"
                        name="apiBadge"
                        placeholder="API Badge Text"
                        value={input.apiBadge}
                        onChange={handleInputChange}
                        required
                     />
                  </div>
                  <div className="col-sm-2">
                     <small className="mb-1">API Badge Color</small>
                     <input
                        type="text"
                        className="form-control form-control-sm"
                        name="apiBadgeColor"
                        placeholder="API Badge Color"
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
               <div className="row mb-2">
                  <div className="col-sm-12 col-md-2">DisplayResponseAs</div>
                  <div className="col-sm-12 col-md-3">
                     <select
                        className="form-select form-select-sm"
                        name="displayResponseAs"
                        value={input.displayResponseAs}
                        onChange={handleInputChange}
                     >
                        <option value="json">JSON</option>
                        <option value="text">PLAIN TEXT</option>
                     </select>
                  </div>
                  {input.displayResponseAs === "text" && (
                     <div className="col-sm-12 col-md-3">
                        <input
                           type="text"
                           className="form-control form-control-sm"
                           name="objectPath"
                           placeholder="objectPath"
                           value={input.objectPath}
                           onChange={handleInputChange}
                        />
                     </div>
                  )}
               </div>

               <ExpectForm expect={input.expect!} setExpect={setExpect} />
               <VariableForm match={input.match} setMatch={setMatchObject} input={input} />
               <div className="row mt-3">
                  <div className="col">
                     <div className="d-flex align-items-center mb-1">
                        <span className="me-2 font-sm">Payload (optional)</span>
                        <span className="me-2 font-sm">type: </span>
                        <PayloadTypeSelector payloadType={input.payloadType || "json"} setPayloadType={setPayloadType} />
                        {input.payloadType === "json" && (
                           <span className="text-hover-highlight primary font-sm ms-auto pointer" onClick={handleBeautify}>
                              Beautify
                           </span>
                        )}
                     </div>
                     <AceEditor
                        mode={input.payloadType === "text" ? "text" : "json"}
                        theme="github"
                        height="300px"
                        width="100%"
                        value={dataText}
                        onChange={setDataText}
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

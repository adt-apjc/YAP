import React, { useContext, useEffect, useState } from "react";
import GlobalContext from "../../contexts/ContextProvider";
import AceEditor from "react-ace";
import "ace-builds/webpack-resolver";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-github";

const ExpectForm = (props) => {
   const [isExpectEnable, setIsExpectEnable] = useState(false);

   const handleExpectTypeChange = (e, index) => {
      let currentExpect = [...props.expect];
      currentExpect[index].type = e.target.value;
      currentExpect[index].value = e.target.value === "codeIs" ? [] : "";
      props.setExpect(currentExpect);
   };

   const handleExpectValueChange = (e, index) => {
      let currentExpect = [...props.expect];
      currentExpect[index].value =
         currentExpect[index].type === "codeIs" ? e.target.value.split(",").map((el) => el.trim()) : e.target.value;
      props.setExpect(currentExpect);
   };

   const handleExpectEnableChange = (e) => {
      if (!e.target.checked) props.setExpect([]);
      setIsExpectEnable(e.target.checked);
   };

   const handleExpectFormDelete = (index) => {
      const newExpectList = props.expect.filter((el, i) => i !== index);
      props.setExpect(newExpectList);
   };

   const renderExpectForm = () => {
      return (
         props.expect &&
         props.expect.map((el, index) => {
            return (
               <div key={index} className="row mb-3">
                  <div className="col-3">
                     <select
                        className="form-select form-select-sm"
                        name="type"
                        value={props.expect[index].type}
                        onChange={(e) => handleExpectTypeChange(e, index)}
                     >
                        <option value="bodyContain">bodyContain</option>
                        <option value="codeIs">HttpResponseCodeIs</option>
                     </select>
                  </div>
                  <div className="col-7">
                     <input
                        className="form-control form-control-sm"
                        type="text"
                        name="value"
                        value={props.expect[index].value}
                        onChange={(e) => handleExpectValueChange(e, index)}
                     />
                  </div>
                  <div className="col-2">
                     <i
                        type="button"
                        className="fal fa-times text-danger icon-hover-highlight"
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
                     type="button"
                     className="fad fa-plus text-info icon-hover-highlight"
                     onClick={() => props.setExpect([...props.expect, { type: "bodyContain", value: "" }])}
                  />
               </div>
            </div>
         ) : null}
      </>
   );
};

const ActionForm = (props) => {
   const context = useContext(GlobalContext);
   const [input, setInput] = useState({
      type: "request",
      useEndpoint: "",
      header: "",
      headerColor: "",
      title: "",
      description: "",
      url: "",
      method: "get",
      displayResponseAs: "json",
      objectPath: "",
      expect: [],
      data: undefined,
   });
   const [isPayloadValid, setIsPayloadValid] = useState(true);
   const [isExpectConfigValid, setIsExpectConfigValid] = useState(true);

   const setExpect = (val) => {
      setInput((prev) => ({ ...prev, expect: val }));
   };

   const onChangeHandler = (e) => {
      setInput((prev) => ({ ...prev, [e.target.name]: e.target.value }));
   };

   const onSubmitHandler = (e) => {
      e.preventDefault();
      if (!isPayloadValid) return;

      const { initValue } = props;
      const actionIndex = initValue ? initValue.actionIndex : null;

      context.addAction(input, props.tab, context.currentStep.name, actionIndex);
      props.onHide();
   };

   const payloadInputHandler = (value) => {
      if (value === "") {
         setIsPayloadValid(true);
         return;
      }

      try {
         let data = JSON.parse(value);
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
      if (!props.initValue) return;

      setInput({ ...props.initValue.action });
   }, [props.initValue]);

   useEffect(() => {
      for (let expect of input.expect) {
         if (expect.value.length === 1 && expect.value[0] === "") {
            setIsExpectConfigValid(false);
            return;
         }
      }
      setIsExpectConfigValid(true);
   }, [input.expect]);

   return (
      <>
         <div className="modal-header">
            <span className="modal-title">
               {props.initValue ? "Edit" : "Add"} {props.tab}
            </span>
            <button type="button" className="btn-close" onClick={props.onHide}></button>
         </div>
         <div className="modal-body">
            <form id="actionForm" onSubmit={(e) => onSubmitHandler(e)}>
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
                           onChange={(e) => onChangeHandler(e)}
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
                           onChange={(e) => onChangeHandler(e)}
                        />
                        <label className="form-check-label" htmlFor="inlineRadio2">
                           polling
                        </label>
                     </div>
                  </div>
                  <div className="col-9">
                     <select
                        className="form-select"
                        name="useEndpoint"
                        onChange={(e) => onChangeHandler(e)}
                        value={input.useEndpoint}
                        required
                     >
                        <option value="">Choose endpoint...</option>
                        {renderEndpointOptions()}
                     </select>
                  </div>
               </div>
               <div className="input-group my-3">
                  <select
                     style={{ maxWidth: 150 }}
                     className="form-select form-select-sm"
                     name="method"
                     value={input.method}
                     onChange={(e) => onChangeHandler(e)}
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
                     onChange={(e) => onChangeHandler(e)}
                  />
               </div>
               <div className="row mb-2">
                  <div className="col-sm-3">
                     <input
                        type="text"
                        className="form-control form-control-sm"
                        name="header"
                        placeholder="Header text"
                        value={input.header}
                        onChange={(e) => onChangeHandler(e)}
                        required
                     />
                  </div>
                  <div className="col-sm-2">
                     <input
                        type="text"
                        className="form-control form-control-sm"
                        name="headerColor"
                        placeholder="Header color"
                        value={input.headerColor}
                        onChange={(e) => onChangeHandler(e)}
                     />
                  </div>
                  <div className="col">
                     <input
                        type="text"
                        className="form-control form-control-sm"
                        name="title"
                        placeholder="title text"
                        value={input.title}
                        onChange={(e) => onChangeHandler(e)}
                        required
                     />
                  </div>
               </div>
               <div className="row mb-3">
                  <div className="col">
                     <textarea
                        className="form-control form-control-sm"
                        name="description"
                        placeholder="Description"
                        value={input.description}
                        onChange={(e) => onChangeHandler(e)}
                     />
                  </div>
               </div>
               <div className="row mb-3">
                  <div className="col-sm-12 col-md-2">DisplayResponseAs</div>
                  <div className="col-sm-12 col-md-3">
                     <select
                        className="form-select form-select-sm"
                        name="displayResponseAs"
                        value={input.displayResponseAs}
                        onChange={(e) => onChangeHandler(e)}
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
                           onChange={(e) => onChangeHandler(e)}
                        />
                     </div>
                  )}
               </div>
               {input.type === "polling" ? (
                  <>
                     <div className="row mb-3">
                        <div className="col">
                           <input
                              type="text"
                              className="form-control form-control-sm"
                              name="maxRetry"
                              placeholder="maxRetry default = 10"
                              value={input.maxRetry}
                              onChange={(e) => onChangeHandler(e)}
                           />
                        </div>
                        <div className="col">
                           <input
                              type="text"
                              className="form-control form-control-sm"
                              name="interval"
                              placeholder="Interval default = 5000ms"
                              value={input.interval}
                              onChange={(e) => onChangeHandler(e)}
                           />
                        </div>
                     </div>
                  </>
               ) : null}
               <ExpectForm expect={input.expect} setExpect={setExpect} />
               <div className="row">
                  <div className="col">
                     <div>
                        <span className="me-2 font-sm">Payload (optional)</span>
                        {!isPayloadValid ? "invalid JSON" : ""}
                     </div>
                     <AceEditor
                        mode="json"
                        theme="github"
                        height="300px"
                        width="100%"
                        defaultValue={JSON.stringify(input.data, null, 4)}
                        onChange={payloadInputHandler}
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
            <button
               type="submit"
               className={`btn btn-primary btn-sm ${!isExpectConfigValid ? "disabled" : ""}`}
               form="actionForm"
            >
               {props.initValue ? "Update" : "Add"}
            </button>
         </div>
      </>
   );
};

export default ActionForm;

import React from "react";
import GlobalContext from "../../contexts/ContextProvider";
import AceEditor from "react-ace";
import "ace-builds/webpack-resolver";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-github";
// import _ from "lodash";
class ExpectForm extends React.Component {
   state = { expect: [], isExpectEnable: false };

   componentDidMount() {
      if (this.props.initValue && this.props.initValue.action.expect) {
         this.setState({ expect: this.props.initValue.action.expect, isExpectEnable: true });
      }
   }

   onExpectFormChange = (e, index) => {
      let currentExpect = this.state.expect;
      currentExpect[index][e.target.name] = e.target.value;
      this.setState({ expect: currentExpect });
   };

   onExpectFormDelete = (index) => {
      const newExpectList = this.state.expect.filter((el, i) => i !== index);
      this.setState({ expect: newExpectList });
   };

   getCurrentStateValue = () => {
      return this.state.expect;
   };

   renderExpectForm = () => {
      return this.state.expect.map((el, index) => {
         return (
            <div key={index} className="row mb-3">
               <div className="col-3">
                  <select
                     className="form-select form-select-sm"
                     name="type"
                     value={this.state.expect[index].type}
                     onChange={(e) => this.onExpectFormChange(e, index)}
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
                     value={this.state.expect[index].value}
                     onChange={(e) => this.onExpectFormChange(e, index)}
                  />
               </div>
               <div className="col-2">
                  <i
                     type="button"
                     className="fal fa-times text-danger icon-hover-highlight"
                     onClick={() => this.onExpectFormDelete(index)}
                  />
               </div>
            </div>
         );
      });
   };

   render() {
      let expectForm = (
         <div>
            {this.renderExpectForm()}
            <div className="w-100 text-center">
               <i
                  type="button"
                  className="fad fa-plus text-info icon-hover-highlight"
                  onClick={() => this.setState({ expect: [...this.state.expect, { type: "bodyContain", value: "" }] })}
               />
            </div>
         </div>
      );
      return (
         <>
            <div className="form-check">
               <input
                  type="checkbox"
                  className="form-check-input"
                  id="enableExpectCheckBox"
                  checked={this.state.isExpectEnable}
                  onChange={(e) => this.setState({ isExpectEnable: e.target.checked })}
               />
               <label className="form-check-label" htmlFor="enableExpectCheckBox">
                  Enable expect
               </label>
            </div>
            {this.state.isExpectEnable ? expectForm : ""}
         </>
      );
   }
}
class ActionForm extends React.Component {
   constructor(props) {
      super(props);
      this.expectRef = React.createRef();
      this.state = {
         input: {
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
            data: this.props.initValue ? this.props.initValue.action.data : undefined,
         },
         isPayloadValid: true,
      };
   }

   componentDidMount() {
      if (this.props.initValue) {
         this.setState({ input: this.props.initValue.action });
      }
   }

   onChangeHandler = (e) => {
      this.setState({ input: { ...this.state.input, [e.target.name]: e.target.value } });
   };

   onSubmitHandler = (e) => {
      e.preventDefault();
      const Context = this.context;
      const { initValue } = this.props;
      const actionIndex = initValue ? initValue.actionIndex : null;
      const expectObject = this.expectRef.current.getCurrentStateValue();
      if (this.state.isPayloadValid) {
         Context.addAction(
            expectObject.length !== 0 ? { ...this.state.input, expect: expectObject } : this.state.input,
            this.props.tab,
            Context.currentStep.name,
            actionIndex
         );
         this.props.onHide();
      }
   };

   payloadInputHandler = (value) => {
      try {
         let data = JSON.parse(value);
         this.setState({ input: { ...this.state.input, data }, isPayloadValid: true });
      } catch (e) {
         this.setState({ isPayloadValid: false });
         delete this.state.input.data;
      }
   };

   renderEndpoints() {
      const Context = this.context;
      if (Context.config.endpoints) {
         let endpoints = [];
         for (let endpoint in Context.config.endpoints) {
            endpoints.push(endpoint);
         }
         return endpoints.map((el, index) => {
            return (
               <option key={index} value={el}>
                  {el}
               </option>
            );
         });
      }
   }

   render() {
      let pollingTypeForm = (
         <>
            <div className="row mb-3">
               <div className="col">
                  <input
                     type="text"
                     className="form-control form-control-sm"
                     name="maxRetry"
                     placeholder="maxRetry default = 10"
                     value={this.state.input.maxRetry}
                     onChange={(e) => this.onChangeHandler(e)}
                  />
               </div>
               <div className="col">
                  <input
                     type="text"
                     className="form-control form-control-sm"
                     name="interval"
                     placeholder="Interval default = 5000ms"
                     value={this.state.input.interval}
                     onChange={(e) => this.onChangeHandler(e)}
                  />
               </div>
            </div>
         </>
      );
      let form = (
         <form id="actionForm" onSubmit={(e) => this.onSubmitHandler(e)}>
            <div className="row align-items-center">
               <div className="col-3">
                  <div className="form-check form-check-inline">
                     <input
                        className="form-check-input"
                        type="radio"
                        name="type"
                        id="inlineRadio1"
                        value="request"
                        checked={this.state.input.type === "request"}
                        onChange={(e) => this.onChangeHandler(e)}
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
                        checked={this.state.input.type === "polling"}
                        onChange={(e) => this.onChangeHandler(e)}
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
                     onChange={(e) => this.onChangeHandler(e)}
                     value={this.state.input.useEndpoint}
                     required
                  >
                     <option value="">Choose endpoint...</option>
                     {this.renderEndpoints()}
                  </select>
               </div>
            </div>
            <div className="input-group my-3">
               <select
                  style={{ maxWidth: 150 }}
                  className="form-select form-select-sm"
                  name="method"
                  value={this.state.input.method}
                  onChange={(e) => this.onChangeHandler(e)}
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
                  value={this.state.input.url}
                  onChange={(e) => this.onChangeHandler(e)}
               />
            </div>
            <div className="row mb-2">
               <div className="col-sm-3">
                  <input
                     type="text"
                     className="form-control form-control-sm"
                     name="header"
                     placeholder="Header text"
                     value={this.state.input.header}
                     onChange={(e) => this.onChangeHandler(e)}
                     required
                  />
               </div>
               <div className="col-sm-2">
                  <input
                     type="text"
                     className="form-control form-control-sm"
                     name="headerColor"
                     placeholder="Header color"
                     value={this.state.input.headerColor}
                     onChange={(e) => this.onChangeHandler(e)}
                  />
               </div>
               <div className="col">
                  <input
                     type="text"
                     className="form-control form-control-sm"
                     name="title"
                     placeholder="title text"
                     value={this.state.input.title}
                     onChange={(e) => this.onChangeHandler(e)}
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
                     value={this.state.input.description}
                     onChange={(e) => this.onChangeHandler(e)}
                  />
               </div>
            </div>
            <div className="row mb-3">
               <div className="col-sm-12 col-md-2">DisplayResponseAs</div>
               <div className="col-sm-12 col-md-3">
                  <select
                     className="form-select form-select-sm"
                     name="displayResponseAs"
                     value={this.state.input.displayResponseAs}
                     onChange={(e) => this.onChangeHandler(e)}
                  >
                     <option value="json">JSON</option>
                     <option value="text">PLAIN TEXT</option>
                  </select>
               </div>
               {this.state.input.displayResponseAs === "text" && (
                  <div className="col-sm-12 col-md-3">
                     <input
                        type="text"
                        className="form-control form-control-sm"
                        name="objectPath"
                        placeholder="objectPath"
                        value={this.state.input.objectPath}
                        onChange={(e) => this.onChangeHandler(e)}
                     />
                  </div>
               )}
            </div>
            {this.state.input.type === "polling" ? pollingTypeForm : ""}
            <ExpectForm ref={this.expectRef} initValue={this.props.initValue} />
            <div className="row mb-3">
               <div className="col">
                  {/* <textarea className="form-control form-control-sm" placeholder="Payload (optional)" /> */}
                  <div>
                     <span className="me-2 font-sm">Payload (optional)</span>
                     {!this.state.isPayloadValid ? "invalid JSON" : ""}
                  </div>
                  <AceEditor
                     mode="json"
                     theme="github"
                     height="300px"
                     width="100%"
                     defaultValue={JSON.stringify(this.state.input.data, null, 4)}
                     onChange={(value) => this.payloadInputHandler(value)}
                     name="data"
                     className="rounded border"
                     editorProps={{ $blockScrolling: true }}
                     showPrintMargin={false}
                  />
               </div>
            </div>
         </form>
      );
      return (
         <>
            <div className="modal-header">
               <span className="modal-title">
                  {this.props.initValue ? "Edit" : "Add"} {this.props.tab}
               </span>
               <button type="button" className="btn-close" onClick={this.props.onHide}></button>
            </div>
            <div className="modal-body">{form}</div>
            <div className="modal-footer p-1">
               <button type="button" className="btn btn-sm" onClick={this.props.onHide}>
                  Close
               </button>
               <button type="submit" className="btn btn-primary btn-sm" form="actionForm">
                  {this.props.initValue ? "Update" : "Add"}
               </button>
            </div>
         </>
      );
   }
}
ActionForm.contextType = GlobalContext;

export default ActionForm;

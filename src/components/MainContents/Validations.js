import React from "react";
import ReactJson from "@uiw/react-json-view";
import GlobalContext from "../contexts/ContextProvider";
import { Modal } from "../../helper/modalHelper";
import ModalContentSelector from "./editForm/ModalContentSelector";

class ValidationDetail extends React.Component {
   getStringFromObject = (obj, path) => {
      let result = obj;
      try {
         if (!path) return JSON.stringify(result, null, 3);
         for (let attr of path.split(".")) {
            result = result[attr];
         }
         return JSON.stringify(result, null, 3);
      } catch (e) {
         console.log(e);
         return `Cannot find value in path ${path}`;
      }
   };

   render() {
      let responseViewer;
      let responseStatus = this.props.response ? `${this.props.response.status} ${this.props.response.statusText}` : "";
      let payloadViewer =
         this.props.request && this.props.request.data ? (
            <div className="p-2">
               payload
               <ReactJson value={this.props.request.data} collapsed={4} />
            </div>
         ) : (
            ""
         );
      let colorMapper = { get: "primary", post: "success", put: "info", patch: "warning", delete: "danger" };

      if (this.props.request && this.props.request.displayResponseAs === "text") {
         responseViewer = this.props.response ? (
            <pre className="p-2">{this.getStringFromObject(this.props.response.data, this.props.request.objectPath)}</pre>
         ) : (
            ""
         );
      } else {
         // default display response as JSON
         responseViewer = this.props.response ? (
            <ReactJson value={typeof this.props.response.data === "object" ? this.props.response.data : {}} collapsed={1} />
         ) : (
            ""
         );
      }

      if (this.props.show) {
         return (
            <div className="container position-relative bg-light pt-2 pb-3" style={{ top: "-15px" }}>
               <div className="p-2">{this.props.request ? this.props.request.description : ""}</div>
               <div className="p-2 d-inline-block mb-2">
                  Endpoint{" "}
                  <span className="font-weight-light bg-secondary text-light p-1 ms-4 rounded">
                     {this.props.request.useEndpoint}
                  </span>
               </div>
               <div className="bg-white p-2 rounded shadow-sm mb-2">
                  <div className="d-flex">
                     <div className={`me-3 font-weight-bolder text-${colorMapper[this.props.request.method]}`}>
                        {this.props.request.method.toUpperCase()}
                     </div>
                     <div className="text-dark">{this.props.request.url}</div>
                  </div>
                  {payloadViewer}
               </div>
               <div className="bg-white p-2 rounded shadow-sm">
                  <div className="d-flex justify-content-between">
                     Response
                     <div className="font-weight-light" style={{ fontSize: "12px" }}>
                        {responseStatus}
                     </div>
                  </div>
                  {responseViewer}
               </div>
            </div>
         );
      } else {
         return null;
      }
   }
}
class Validations extends React.Component {
   constructor(props) {
      super(props);
      this.state = { selectedAPI: [], modalShow: false, modalContentType: null, selectedAction: null };
   }

   expandDetailHandler = (index) => {
      if (!this.state.selectedAPI.includes(index)) {
         this.setState({ selectedAPI: [...this.state.selectedAPI, index] });
      } else {
         this.setState({ selectedAPI: this.state.selectedAPI.filter((ele) => ele !== index) });
      }
   };

   isActionRunning = (type, index) => {
      if (this.props.currentRunning) {
         return this.props.currentRunning.type === type && this.props.currentRunning.index === index;
      } else {
         // null mean not running
         return false;
      }
   };

   render() {
      let Context = this.context;
      let apiList;
      // check if it collasped
      if (!this.props.show) return null;
      //
      if (this.props.currentStepDetails.validations && this.props.currentStepDetails.validations.length !== 0) {
         apiList = this.props.currentStepDetails.validations.map((validation, index) => {
            //
            let runResultStatus =
               this.props.results && this.props.results[index] ? (
                  this.props.results[index].success ? (
                     <i className="fad fa-check m-2 text-success" />
                  ) : (
                     <i className="fad fa-exclamation-circle m-2 text-danger" />
                  )
               ) : (
                  ""
               );
            return (
               <div className="mt-2" key={index}>
                  <div
                     className={`shadow-sm p-3 mb-3 bg-light text-secondary rounded pointer ${
                        this.isActionRunning("validation", index) ? "border" : ""
                     }`}
                     onClick={() => this.expandDetailHandler(index)}
                  >
                     <div className="d-flex justify-content-between">
                        <div>
                           <div
                              className={`api-method-badge text-light me-3 rounded`}
                              style={{ backgroundColor: validation.headerColor ? validation.headerColor : "#007cad" }}
                           >
                              {validation.header ? validation.header : "NO HEADER"}
                           </div>
                           {validation.title ? validation.title : "NO TITLE"}
                        </div>
                        <div>
                           {/* <button
                              className="btn btn-sm btn-secondary mx-2"
                              onClick={(e) => {
                                 e.stopPropagation();
                                 this.props.onRunValidationWorkflow(validation, index);
                              }}
                           >
                              run
                           </button> */}
                           {Context.mode === "edit" && (
                              <>
                                 <span
                                    className="px-1 font-sm font-weight-light text-info text-hover-highlight"
                                    onClick={(e) => {
                                       e.stopPropagation();
                                       this.setState({
                                          modalShow: true,
                                          modalContentType: "validation",
                                          selectedAction: { action: validation, actionIndex: index },
                                       });
                                    }}
                                 >
                                    Edit
                                 </span>
                                 <span
                                    className="px-1 font-sm font-weight-light text-danger text-hover-highlight"
                                    onClick={(e) => {
                                       e.stopPropagation();
                                       this.setState({
                                          modalShow: true,
                                          modalContentType: "actionDeleteConfirm",
                                          selectedAction: { action: validation, actionIndex: index, tab: "validations" },
                                       });
                                    }}
                                 >
                                    Delete
                                 </span>
                              </>
                           )}

                           <i className={`fas fa-caret-${this.state.selectedAPI.includes(index) ? "down" : "right"}`}></i>
                           {this.isActionRunning("validation", index) ? <i className="fas fa-spinner fa-spin m-2" /> : ""}
                           {runResultStatus}
                        </div>
                     </div>
                  </div>
                  <ValidationDetail
                     show={this.state.selectedAPI.includes(index)}
                     response={this.props.results && this.props.results[index] ? this.props.results[index] : null}
                     request={validation}
                  />
               </div>
            );
         });
      } else {
         apiList = <div className="shadow-sm p-3 mb-3 bg-light text-secondary rounded pointer">No API request configured.</div>;
      }
      return (
         <div className="container">
            {apiList}
            <Modal
               show={this.state.modalShow}
               onHide={() => this.setState({ modalShow: false, modalContentType: null, selectedAction: null })}
               width="70%"
            >
               <ModalContentSelector
                  onHide={() => this.setState({ modalShow: false, modalContentType: null, selectedAction: null })}
                  initValue={this.state.selectedAction}
                  contentType={this.state.modalContentType}
               />
            </Modal>
         </div>
      );
   }
}
Validations.contextType = GlobalContext;

export default Validations;
export { ValidationDetail };

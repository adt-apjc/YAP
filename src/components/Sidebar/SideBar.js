import React from "react";
import { Modal } from "../../helper/modalHelper";
import GlobalContext from "../contexts/ContextProvider";
import _ from "lodash";
import MoreOption from "./MoreOption";
import { saveAs } from "file-saver";

class DeleteConfirmation extends React.Component {
   onDeleteHandler = () => {
      const Context = this.context;
      Context.deleteStep(this.props.selectedStep.name);
      this.props.onHide();
   };

   render() {
      return (
         <>
            <div className="modal-header">
               <span className="modal-title">Confirm Deletion</span>
               <button type="button" className="btn-close" onClick={this.props.onHide}></button>
            </div>
            <div className="modal-body">
               Title:{" "}
               <span className="text-danger font-weight-light font-italic">
                  {this.props.selectedStep ? this.props.selectedStep.label : ""}
               </span>
            </div>
            <div className="modal-footer">
               <button type="button" className="btn btn-sm" onClick={this.props.onHide}>
                  Close
               </button>
               <button type="button" className="btn btn-danger btn-sm" onClick={this.onDeleteHandler}>
                  Delete
               </button>
            </div>
         </>
      );
   }
}
DeleteConfirmation.contextType = GlobalContext;

class SideBar extends React.Component {
   state = { activeAddStep: false, activeEditMainTitle: false, input: "", modalShow: false, selectedStep: null, titleInput: "" };

   componentDidMount = () => {
      let Context = this.context;
      Context.registerClearStateFunction(this.clearStateHandler, "sidebar");
      // window.onbeforeunload = function (event) {
      //    return "";
      // };
   };

   componentWillUnmount = () => {
      let Context = this.context;
      Context.unregisterClearStateFunction("sidebar");
   };

   clearStateHandler = () => {
      let Context = this.context;
      Context.setRunningStatus();
      console.log("DEBUG - clear state from sidebar run");
   };

   isSomeStepRunning = () => {
      let Context = this.context;
      for (let i in Context.runningStatus) {
         if (Context.runningStatus[i] === "running") return true;
      }
      return false;
   };

   addNewStageHandler = () => {
      const Context = this.context;
      Context.addStep(this.state.input);
      this.setState({ activeAddStep: false });
   };

   editTitleNameHandler = () => {
      const Context = this.context;
      let currentConfig = _.cloneDeep(Context.config);
      currentConfig.title = this.state.titleInput;
      Context.updateConfig(currentConfig);
      this.setState({ activeEditMainTitle: false });
   };

   exportProjectHandler = () => {
      let Context = this.context;
      console.log("export:", Context.config);
      let blob = new Blob([JSON.stringify(Context.config, null, 2)], { type: "text/plain;charset=utf-8" });
      saveAs(blob, `${Context.config.title || "project"}.json`);
   };

   onFileChange = (event) => {
      event.stopPropagation();
      let Context = this.context;
      let file = event.target.files[0];
      console.log(file);
      if (file) {
         const reader = new FileReader();
         // define callback
         reader.onabort = () => console.log("file reading was aborted");
         reader.onerror = () => console.log("file reading has failed");
         reader.onloadend = () => {
            // Do whatever you want with the file contents
            const contentString = reader.result;
            try {
               const config = JSON.parse(contentString);
               // reset currentStep, running Status and clear currentState before load configuration
               Context.clearConfig();
               // change config context
               Context.updateConfig(config);
               window.localStorage.setItem("configData", contentString);
               this.importRef.value = "";
            } catch (e) {
               console.log(e);
               this.importRef.value = "";
            }
         };
         // read file content
         reader.readAsText(file);
      }
   };

   render() {
      const Context = this.context;
      let statusIcon;
      const sideMenuList = Context.config.sidebar.map((element, index) => {
         if (Context.runningStatus[element.name] === "success") {
            statusIcon = <i className={"fad ms-2 me-3 fa-circle text-success"} />;
         } else if (Context.runningStatus[element.name] === "running") {
            statusIcon = <i className={"fal fa-spinner fa-spin text-light ms-2 me-3"} />;
         } else if (Context.runningStatus[element.name] === "fail") {
            statusIcon = <i className={"fad ms-2 me-3 fa-circle text-danger"} />;
         } else {
            statusIcon = (
               <i className={`${Context.currentStep.name === element.name ? "fas" : "fal"} ms-2 me-3 fa-circle text-light`} />
            );
         }
         return (
            <div
               key={index}
               className={`side-item mb-3 justify-content-between pointer ${this.isSomeStepRunning() ? "disabled" : ""}`}
               style={{ fontSize: "20px" }}
               onClick={() => Context.setCurrentStep(element)}
            >
               <div>
                  {statusIcon}
                  <span
                     className={`collapse-icon font-weight-${
                        Context.currentStep.name === element.name ? "bold text-light" : "normal"
                     }`}
                  >
                     {element.label}
                  </span>
               </div>
               {Context.mode === "edit" && (
                  <i
                     className="fad fa-trash mx-2 icon-hover-highlight"
                     onClick={(e) => {
                        e.stopPropagation();
                        this.setState({ modalShow: true, selectedStep: element });
                     }}
                  />
               )}
            </div>
         );
      });

      return (
         <>
            <div className="sidenav">
               <div className="sidenav-container">
                  {/* ICON */}
                  <div
                     className={`text-center text-light p-4 pointer ${this.isSomeStepRunning() ? "disabled" : ""}`}
                     style={{ fontSize: "20px" }}
                     onClick={() => Context.setCurrentStep(Context.config.preface ? {} : { ...Context.config.sidebar[0] })}
                  >
                     {this.state.activeEditMainTitle ? (
                        <input
                           type="text"
                           value={this.state.titleInput}
                           onChange={(e) => this.setState({ titleInput: e.target.value })}
                        />
                     ) : (
                        <span>{Context.config.title ? Context.config.title : <i className="fal fa-paper-plane" />}</span>
                     )}
                     {Context.mode === "edit" && (
                        <div className="font-sm float-right text-hover-highlight">
                           {this.state.activeEditMainTitle ? (
                              <div onClick={this.editTitleNameHandler}>done</div>
                           ) : (
                              <div onClick={() => this.setState({ activeEditMainTitle: true, titleInput: Context.config.title })}>
                                 Edit
                              </div>
                           )}
                        </div>
                     )}
                  </div>
                  <div style={{ borderBottom: "1px solid #01719c", marginBottom: "1rem" }}></div>
                  {/* IMPORT/EXPORT */}

                  {/* Content list */}
                  {sideMenuList}
                  {this.state.activeAddStep && (
                     <div className="input-group my-2">
                        <input
                           type="text"
                           className="form-control form-control-sm"
                           placeholder="Name"
                           value={this.state.input}
                           onChange={(e) => this.setState({ input: e.target.value })}
                        />
                        <div className="input-group-append">
                           <button type="button" className="btn btn-sm btn-info" onClick={this.addNewStageHandler}>
                              Add
                           </button>
                        </div>
                     </div>
                  )}
                  {Context.mode === "edit" && (
                     <div className="text-center text-light">
                        <i
                           className={`fad fa-${
                              this.state.activeAddStep ? "minus" : "plus"
                           }-circle pointer font-lg icon-hover-highlight`}
                           onClick={() => this.setState({ activeAddStep: !this.state.activeAddStep })}
                        />
                     </div>
                  )}
               </div>
               <div className="sidenav-footer">
                  <div className="d-flex justify-content-between my-3">
                     <div
                        className="collapse-icon text-light pointer"
                        onClick={() => {
                           if (_.isEmpty(Context.config.mainContent.cleanup)) {
                              Context.clearStateHandler();
                           } else {
                              Context.setCurrentStep({ name: "cleanup", label: "clean up" });
                           }
                        }}
                     >
                        Clean up
                     </div>
                     {Context.mode === "edit" && (
                        <div className="d-flex">
                           <div
                              className="px-1 icon-hover-highlight pointer text-light font-sm"
                              onClick={() => this.importRef.click()}
                           >
                              <i className="fal fa-file-import" />
                              {"   "}
                              Import
                              <input
                                 id="importFile"
                                 type="file"
                                 ref={(ref) => (this.importRef = ref)}
                                 style={{ display: "none" }}
                                 onChange={this.onFileChange}
                              />
                           </div>
                           <div
                              className="px-1 icon-hover-highlight pointer text-light font-sm"
                              onClick={this.exportProjectHandler}
                           >
                              <i className="fal fa-download" />
                              {"   "}
                              Export
                           </div>
                        </div>
                     )}
                     <MoreOption />
                  </div>
               </div>
            </div>
            <Modal show={this.state.modalShow} onHide={() => this.setState({ modalShow: false })}>
               <DeleteConfirmation onHide={() => this.setState({ modalShow: false })} selectedStep={this.state.selectedStep} />
            </Modal>
         </>
      );
   }
}
SideBar.contextType = GlobalContext;

export default SideBar;

import React from "react";
import GlobalContext from "../contexts/ContextProvider";
import { normalRequest, pollingRequest } from "../../helper/actionHelper";
import { Modal } from "../../helper/modalHelper";
import ModalContentSelector from "./editForm/ModalContentSelector";
import Actions from "./Actions";
import Validations from "./Validations";
import Outcome from "./Outcome";

import _ from "lodash";
import Logo from "./Logo";
import PreCheck from "./PreCheck";
import RunButtonComponent from "./RunButtonComponent";

class DemoContent extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
         currentRunning: null,
         isActionCompleted: {},
         isValidationCompleted: {},
         actionResults: {},
         validationResults: {},
         actionSectionShow: false,
         validationSectionShow: false,
         outcomeSectionShow: false,
         modalShow: false,
         modalContentType: null,
         preCheckSectionShow: false,
      };
   }

   componentDidUpdate(prevProps, prevState) {
      if (prevProps.currentStep.name !== this.props.currentStep.name) {
         this.setState({ actionSectionShow: false, validationSectionShow: false, outcomeSectionShow: false });
      }
   }

   componentDidMount = () => {
      let Context = this.context;
      const mainContentState = window.localStorage.getItem("mainContentState");
      Context.registerClearStateFunction(this.clearStateHandler, "demoContent");
      // load config from localStorage if exist
      if (mainContentState) {
         this.setState({ ...JSON.parse(mainContentState) });
         console.log("DEBUG - load value from localStorage");
      }
   };

   componentWillUnmount = () => {
      let Context = this.context;
      Context.unregisterClearStateFunction("demoContent");
   };

   clearStateHandler = () => {
      this.setState((prev) => ({
         isActionCompleted: { cleanup: prev.isActionCompleted },
         isValidationCompleted: { cleanup: prev.isValidationCompleted },
         actionResults: { cleanup: prev.actionResults.cleanup },
         validationResults: { cleanup: prev.actionResults.cleanup },
         currentRunning: null,
         modalShow: false,
         modalContentType: null,
      }));
      console.log("DEBUG - clear state from sidebar demoContent");
   };

   saveStateToLocalStorage = () => {
      window.localStorage.setItem("mainContentState", JSON.stringify(this.state));
   };

   startWorkflowHandler = async () => {
      let Context = this.context;
      // set running status in global context
      Context.setRunningStatus(this.props.currentStep.name, "running");
      // clear complete status of current step before start
      this.setState({
         isActionCompleted: { ...this.state.isActionCompleted, [this.props.currentStep.name]: false },
         isValidationCompleted: { ...this.state.isValidationCompleted, [this.props.currentStep.name]: false },
      });
      let isActionCompleted = await this.runActionWorkflowHandler();

      if (!isActionCompleted && !this.props.currentStepDetails.continueOnFail) {
         Context.setRunningStatus(this.props.currentStep.name, "fail");
         return;
      }
      // if it is cleanup module also run clearStateHandler() after runAction complete successfully
      if (this.props.currentStep.name === "cleanup" && isActionCompleted) {
         Context.clearStateHandler();
      }
      // after action complete delay 500 ms and start validation
      setTimeout(async () => {
         let isValidationCompleted = await this.runValidationWorkflowHandler();
         // set globalContext status on sidebar
         Context.setRunningStatus(this.props.currentStep.name, isActionCompleted && isValidationCompleted ? "success" : "fail");
      }, 500);
   };

   runActionWorkflowHandler = async () => {
      let isCompleted = true;
      let Context = this.context;
      let index = 0;
      let { currentStepDetails } = this.props;
      // clear old state before start
      this.setState({
         currentRunning: null,
         actionResults: { ...this.state.actionResults, [this.props.currentStep.name]: {} },
      });
      // validate if it has validation configured or not
      if (!currentStepDetails.actions) return null;
      //
      for (let action of currentStepDetails.actions) {
         // SET current running state before start.
         this.setState({ currentRunning: { type: "action", index } });
         try {
            let response;
            if (action.type === "request") {
               // normal request
               response = await normalRequest(action, Context.config.endpoints);
            } else if (action.type === "polling") {
               // polling request
               response = await pollingRequest(action, Context.config.endpoints);
            }
            //
            if (!response.success) isCompleted = false;
            // update state actionResults for specific step
            this.setState(
               {
                  actionResults: {
                     ...this.state.actionResults,
                     [this.props.currentStep.name]: {
                        ...this.state.actionResults[this.props.currentStep.name],
                        [index]: response,
                     },
                  },
                  currentRunning: null,
               },
               this.saveStateToLocalStorage,
            );
         } catch (e) {
            isCompleted = false;
            console.log(e);
            // update state actionResults for specific step
            this.setState(
               {
                  actionResults: {
                     ...this.state.actionResults,
                     [this.props.currentStep.name]: {
                        ...this.state.actionResults[this.props.currentStep.name],
                        [index]: e,
                     },
                  },
                  currentRunning: null,
               },
               this.saveStateToLocalStorage,
            );
            // check continueOnFail
            if (!currentStepDetails.continueOnFail) {
               break;
            }
         }
         index += 1;
      }
      // set status on action bar
      this.setState({
         isActionCompleted: {
            ...this.state.isActionCompleted,
            [this.props.currentStep.name]: isCompleted,
         },
      });
      return isCompleted;
   };

   runValidationWorkflowHandler = async () => {
      let isCompleted = true;
      let Context = this.context;
      let index = 0;
      let { currentStepDetails } = this.props;
      // clear old state before start
      this.setState({
         currentRunning: null,
         validationResults: { ...this.state.validationResults, [this.props.currentStep.name]: {} },
      });
      // validate if it has validation configured or not
      if (!currentStepDetails.validations) return true;
      // start
      for (let validation of currentStepDetails.validations) {
         // SET current running state before start.
         this.setState({ currentRunning: { type: "validation", index } });
         try {
            let response;
            if (validation.type === "request") {
               // normal request
               response = await normalRequest(validation, Context.config.endpoints);
            } else if (validation.type === "polling") {
               // polling request
               response = await pollingRequest(validation, Context.config.endpoints);
            }
            //
            if (!response.success) isCompleted = false;
            // update state validationResults for specific step
            this.setState(
               {
                  validationResults: {
                     ...this.state.validationResults,
                     [this.props.currentStep.name]: {
                        ...this.state.validationResults[this.props.currentStep.name],
                        [index]: response,
                     },
                  },
                  currentRunning: null,
               },
               this.saveStateToLocalStorage,
            );
         } catch (e) {
            isCompleted = false;
            console.log(e);
            // update state validationResults for specific step
            this.setState(
               {
                  validationResults: {
                     ...this.state.validationResults,
                     [this.props.currentStep.name]: {
                        ...this.state.validationResults[this.props.currentStep.name],
                        [index]: e,
                     },
                  },
                  currentRunning: null,
               },
               this.saveStateToLocalStorage,
            );
            // check continueOnFail
            if (!currentStepDetails.continueOnFail) {
               break;
            }
         }
         index += 1;
      }
      // set status on action bar
      this.setState({
         isValidationCompleted: {
            ...this.state.isValidationCompleted,
            [this.props.currentStep.name]: isCompleted,
         },
      });
      return isCompleted;
   };

   render() {
      let Context = this.context;
      let description = this.props.currentStepDetails.description;
      if (_.isArray(description)) {
         description = this.props.currentStepDetails.description.map((el, i) => {
            return (
               <div
                  key={i}
                  className="text-justify"
                  dangerouslySetInnerHTML={{
                     __html: el,
                  }}
               ></div>
            );
         });
      }

      return (
         <>
            {/* HEADER SECTION */}
            <div className="d-flex justify-content-between">
               <div className="d-flex flex-column">
                  <div className="d-flex">
                     <Logo />
                     <div style={{ fontSize: "25px" }}>{this.props.currentStep.label}</div>
                  </div>
                  <div className="my-2 me-3">{description}</div>
                  {Context.mode === "edit" && (
                     <div className="d-flex">
                        <span
                           className="text-info font-sm pointer text-hover-highlight"
                           onClick={() =>
                              this.setState({
                                 modalShow: true,
                                 modalContentType: "editStepDescription",
                                 paramValues: {
                                    title: this.props.currentStep.label,
                                    description: this.props.currentStepDetails.description,
                                 },
                              })
                           }
                        >
                           Edit
                        </span>
                     </div>
                  )}
               </div>

               <div className="text-nowrap">
                  <button
                     className="btn btn-sm btn-primary float-right align-self-center"
                     onClick={this.startWorkflowHandler}
                     disabled={!this.props.currentStepDetails.actions || this.state.currentRunning ? true : false}
                  >
                     {this.state.currentRunning ? (
                        <i className="fas fa-spinner fa-spin m-1" />
                     ) : _.isEmpty(this.state.actionResults[this.props.currentStep.name]) ? (
                        "Run"
                     ) : (
                        "Re-run"
                     )}
                  </button>
               </div>
            </div>
            <div className="mt-3 mb-4" style={{ borderBottom: "1px solid #eaeaea" }}></div>
            {/* PRE-CHECK */}
            <div className="section-container my-1">
               <div
                  className="section-header d-flex justify-content-between pointer"
                  onClick={() => this.setState({ preCheckSectionShow: !this.state.preCheckSectionShow })}
               >
                  <div className="d-flex align-items-center">
                     <span className="font-weight-bold">Pre-Check</span>
                     <RunButtonComponent currentRunning={null} workflowHandler={() => null} />
                  </div>
                  <div>
                     {Context.mode === "edit" && (
                        <span
                           className="text-info font-sm text-hover-highlight pointer"
                           onClick={(e) => {
                              e.stopPropagation();
                              this.setState({ modalShow: true, modalContentType: "action" });
                           }}
                        >
                           Add
                        </span>
                     )}
                     <i className={`p-2 fas fa-caret-${this.state.preCheckSectionShow ? "down" : "right"}`}></i>
                  </div>
               </div>
               <PreCheck show={this.state.preCheckSectionShow} />
            </div>
            {/* ACTION */}
            <div className="section-container my-1">
               <div
                  className="section-header d-flex justify-content-between pointer"
                  onClick={() => this.setState({ actionSectionShow: !this.state.actionSectionShow })}
               >
                  <div className="d-flex align-items-center">
                     <span className="font-weight-bold">Actions</span>
                     <RunButtonComponent currentRunning={null} workflowHandler={() => null} />
                  </div>

                  <div>
                     {Context.mode === "edit" && (
                        <span
                           className="text-info font-sm text-hover-highlight pointer"
                           onClick={(e) => {
                              e.stopPropagation();
                              this.setState({ modalShow: true, modalContentType: "action" });
                           }}
                        >
                           Add
                        </span>
                     )}
                     {this.state.isActionCompleted[this.props.currentStep.name] ? (
                        <i className="fad fa-check m-2 text-success" />
                     ) : null}
                     <i className={`p-2 fas fa-caret-${this.state.actionSectionShow ? "down" : "right"}`}></i>
                  </div>
               </div>
               <Actions
                  show={this.state.actionSectionShow}
                  currentStepDetails={this.props.currentStepDetails}
                  currentRunning={this.state.currentRunning}
                  results={this.state.actionResults[this.props.currentStep.name]}
               />
            </div>
            {/* VALIDATION */}
            <div className="section-container my-1">
               <div
                  className="section-header d-flex justify-content-between pointer"
                  onClick={() => this.setState({ validationSectionShow: !this.state.validationSectionShow })}
               >
                  <div className="d-flex align-items-center">
                     <span className="font-weight-bold">Post-Check</span>
                     <RunButtonComponent
                        currentRunning={this.state.currentRunning}
                        workflowHandler={this.runValidationWorkflowHandler}
                     />
                  </div>
                  <div>
                     {Context.mode === "edit" && (
                        <span
                           className="text-info font-sm text-hover-highlight pointer"
                           onClick={(e) => {
                              e.stopPropagation();
                              this.setState({ modalShow: true, modalContentType: "validation" });
                           }}
                        >
                           Add
                        </span>
                     )}
                     {this.state.isValidationCompleted[this.props.currentStep.name] ? (
                        <i className="fad fa-check m-2 text-success" />
                     ) : (
                        ""
                     )}
                     <i className={`p-2 fas fa-caret-${this.state.validationSectionShow ? "down" : "right"}`}></i>
                  </div>
               </div>
               <Validations
                  show={this.state.validationSectionShow}
                  currentStepDetails={this.props.currentStepDetails}
                  currentRunning={this.state.currentRunning}
                  results={this.state.validationResults[this.props.currentStep.name]}
               />
            </div>
            {/* OUTCOME */}
            <div className="section-container my-1">
               <div
                  className="section-header d-flex justify-content-between pointer"
                  onClick={() => this.setState({ outcomeSectionShow: !this.state.outcomeSectionShow })}
               >
                  <div>
                     <span className="font-weight-bold">Outcome</span>
                     <span className="font-weight-light mx-5">
                        {/* {this.props.currentStepDetails.outcome && this.state.isActionCompleted[this.props.currentStep.name] */}
                        {this.props.currentStepDetails.outcome && Context.runningStatus[this.props.currentStep.name] === "success"
                           ? this.props.currentStepDetails.outcome.summaryText
                           : ""}
                     </span>
                  </div>
                  <div>
                     {Context.mode === "edit" && (
                        <span
                           className="text-info font-sm text-hover-highlight pointer"
                           onClick={(e) => {
                              e.stopPropagation();
                              this.setState({
                                 modalShow: true,
                                 modalContentType: "editOutcome",
                                 paramValues: this.props.currentStepDetails.outcome,
                              });
                           }}
                        >
                           Edit
                        </span>
                     )}
                     <i className={`p-2 fas fa-caret-${this.state.outcomeSectionShow ? "down" : "right"}`}></i>
                  </div>
               </div>
               <Outcome show={this.state.outcomeSectionShow} currentStepDetails={this.props.currentStepDetails} />
            </div>
            <Modal
               show={this.state.modalShow}
               onHide={() => this.setState({ modalShow: false, modalContentType: null, paramValues: null })}
               width="70%"
            >
               <ModalContentSelector
                  onHide={() => this.setState({ modalShow: false, modalContentType: null, paramValues: null })}
                  initValue={this.state.paramValues}
                  contentType={this.state.modalContentType}
               />
            </Modal>
         </>
      );
   }
}
DemoContent.contextType = GlobalContext;

export default DemoContent;

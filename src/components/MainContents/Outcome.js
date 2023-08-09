import React from "react";
import GlobalContext from "../contexts/ContextProvider";
import { Modal } from "../../helper/modalHelper";
import CytoscapeComponent from "react-cytoscapejs";
import { normalRequest, pollingRequest } from "../../helper/actionHelper";
import { ValidationDetail } from "./Validations";
import stylesheet from "./cytoscapeStyle.json";
import _ from "lodash";
class CommandModal extends React.Component {
   state = { actionResults: null, actionObject: null, isRunning: false };

   runHandler = async () => {
      let Context = this.context;
      let { actionObject } = this.state;
      this.setState({ isRunning: true });
      try {
         let response;
         if (actionObject && actionObject.type === "request") {
            // normal request
            response = await normalRequest(actionObject, Context.config.endpoints);
         } else if (actionObject && actionObject.type === "polling") {
            // polling request
            response = await pollingRequest(actionObject, Context.config.endpoints);
         }
         // update state actionResults for specific step
         this.setState({ actionResults: response, isRunning: false });
      } catch (e) {
         console.log(e);
         // update state actionResults for specific step
         this.setState({ actionResults: e, isRunning: false });
      }
   };

   renderSelectOpion() {
      let { outcomeConfig } = this.props;
      if (outcomeConfig.commands && outcomeConfig.commands[this.props.selectedElement.id]) {
         return outcomeConfig.commands[this.props.selectedElement.id].map((cmd, index) => {
            return (
               <option key={index} value={index}>
                  {cmd.title}
               </option>
            );
         });
      }
   }

   selectChangeHandler = (e) => {
      let { outcomeConfig, selectedElement } = this.props;
      this.setState({ actionObject: outcomeConfig.commands[selectedElement.id][e.target.value] });
   };

   render() {
      return (
         <div className="container-fluid">
            <div className="input-group mb-3">
               <select className="form-select" onChange={this.selectChangeHandler}>
                  <option>Choose command to run</option>
                  {this.renderSelectOpion()}
               </select>
               <div className="input-group-append">
                  <button className="btn btn-outline-secondary" onClick={this.runHandler}>
                     {this.state.isRunning ? (
                        <>
                           Running
                           <i className="fas fa-spinner fa-spin m-1" />
                        </>
                     ) : (
                        "Run"
                     )}
                  </button>
               </div>
            </div>
            <div>
               <ValidationDetail
                  show={this.state.actionResults ? true : false}
                  response={this.state.actionResults}
                  request={this.state.actionObject}
               />
            </div>
         </div>
      );
   }
}
CommandModal.contextType = GlobalContext;

class TopologyWrapper extends React.Component {
   setUpEventListeners = () => {
      this.cy.on("tap", "node,edge", (event) => {
         let selectedEle = event.target;
         // console.log(selectedEle);
         if (this.props.onNodeClick) {
            this.props.onNodeClick(selectedEle);
         }
      });
   };

   getObjectData = () => {
      // use for return current cy object elements
      let topologyObj = {};
      topologyObj["nodes"] = this.cy.nodes().map((el) => ({
         data: el.data(),
         position: el.position(),
         classes: el.classes(),
      }));
      topologyObj["edges"] = this.cy.edges().map((el) => ({ data: el.data(), classes: el.classes() }));
      return topologyObj;
   };

   componentWillUnmount() {
      this.cy.removeAllListeners();
      this.cy.destroy();
      console.log("topology cleaned up");
   }

   componentDidUpdate() {
      if (this.props.outcomeConfig.elements) {
         this.props.outcomeConfig.elements.nodes.forEach((ele) => {
            if (ele.data.width) {
               this.cy.$("#" + ele.data.id).style("width", ele.data.width);
            }
            if (ele.data.height) {
               this.cy.$("#" + ele.data.id).style("height", ele.data.height);
            }
         });
      }
   }

   componentDidMount() {
      this.cy.ready(() => {
         this.cy.center();
         this.cy.zoomingEnabled(false);
         this.cy.panningEnabled(false);
         this.cy.boxSelectionEnabled(false);
         this.setUpEventListeners();
         if (this.props.outcomeConfig.elements) {
            this.props.outcomeConfig.elements.nodes.forEach((ele) => {
               if (ele.data.width) {
                  this.cy.$("#" + ele.data.id).style("width", ele.data.width);
               }
               if (ele.data.height) {
                  this.cy.$("#" + ele.data.id).style("height", ele.data.height);
               }
            });
         }
      });
   }

   render() {
      let { outcomeConfig } = this.props;

      return (
         <CytoscapeComponent
            // must cloneDeep because CytoscapeComponent take element as pointer and try to change/remember the last state of every element.
            elements={CytoscapeComponent.normalizeElements(_.cloneDeep(outcomeConfig.elements || {}))}
            style={{ width: "100%", height: outcomeConfig.canvasHeight ? outcomeConfig.canvasHeight : "500px" }}
            stylesheet={stylesheet}
            cy={(cy) => {
               this.cy = cy;
            }}
         />
      );
   }
}

class Outcome extends React.Component {
   constructor(props) {
      super(props);
      this.state = { modalShow: false, selectedElement: null };
   }

   nodeClickHandler = (nodeElement) => {
      let nodeData = nodeElement.data();
      let outcomeConfig = this.props.currentStepDetails.outcome;
      // check if selected node has configured commands ?
      if (outcomeConfig.commands && outcomeConfig.commands[nodeData.id]) {
         this.setState({ selectedElement: nodeData, modalShow: true });
      }
   };

   render() {
      let outcomeConfig = this.props.currentStepDetails.outcome;

      if (this.props.show) {
         if (outcomeConfig) {
            return (
               <div className="container-fluid">
                  <TopologyWrapper outcomeConfig={outcomeConfig} onNodeClick={this.nodeClickHandler} />
                  <Modal show={this.state.modalShow} onHide={() => this.setState({ modalShow: false })}>
                     <div className="modal-header">
                        <span className="modal-title">{this.state.selectedElement ? this.state.selectedElement.id : ""}</span>
                        <button type="button" className="btn-close" onClick={() => this.setState({ modalShow: false })}></button>
                     </div>
                     <div className="modal-body">
                        <CommandModal selectedElement={this.state.selectedElement} outcomeConfig={outcomeConfig} />
                     </div>
                     <div className="modal-footer">
                        <button
                           type="button"
                           className="btn btn-secondary btn-sm"
                           onClick={() => this.setState({ modalShow: false })}
                        >
                           Close
                        </button>
                     </div>
                  </Modal>
               </div>
            );
         } else {
            return (
               <div className="text-center">
                  <div>No configuration</div>
               </div>
            );
         }
      } else {
         return null;
      }
   }
}

export { TopologyWrapper };
export default Outcome;

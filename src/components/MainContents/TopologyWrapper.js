import React from "react";
import CytoscapeComponent from "react-cytoscapejs";
import stylesheet from "./cytoscapeStyle.json";
import _ from "lodash";

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

export default TopologyWrapper;

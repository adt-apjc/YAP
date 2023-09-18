import { useEffect, useRef } from "react";
import { useDidUpdateEffect } from "../contexts/CustomHooks";
import CytoscapeComponent from "react-cytoscapejs";
import { stylesheet } from "./cytoscapeStyle";
import _ from "lodash";
import cytoscape from "cytoscape";
import { OutcomeType } from "../contexts/ContextTypes";

type TopologyWrapperProps = {
   cy?: (cy: cytoscape.Core) => void;
   onNodeClick: (n: cytoscape.NodeSingular) => void;
   outcomeConfig: OutcomeType;
};

const TopologyWrapper = (props: TopologyWrapperProps) => {
   let cyRef = useRef<cytoscape.Core | null>(null);

   const setUpEventListeners = () => {
      cyRef.current!.on("tap", "node,edge", (event) => {
         let selectedEle = event.target;
         // console.log(selectedEle);
         if (props.onNodeClick) {
            props.onNodeClick(selectedEle);
         }
      });
   };

   useEffect(() => {
      return () => {
         cyRef.current!.removeAllListeners();
         cyRef.current!.destroy();
         console.log("topology cleaned up");
      };
   }, []);

   useDidUpdateEffect(() => {
      if (props.outcomeConfig.elements) {
         props.outcomeConfig.elements.nodes.forEach((ele) => {
            if (ele.data.width) {
               cyRef.current!.$("#" + ele.data.id).style("width", ele.data.width);
            }
            if (ele.data.height) {
               cyRef.current!.$("#" + ele.data.id).style("height", ele.data.height);
            }
         });
      }
      // re-center topology
      if (!cyRef.current) return;
      cyRef.current.zoomingEnabled(true);
      cyRef.current.panningEnabled(true);
      cyRef.current.center();
      cyRef.current.zoomingEnabled(false);
      cyRef.current.panningEnabled(false);
   }, [props.outcomeConfig]);

   useEffect(() => {
      if (!cyRef.current) return;
      if (typeof props.cy === "function") props.cy(cyRef.current);

      cyRef.current.ready(() => {
         cyRef.current!.center();
         cyRef.current!.boxSelectionEnabled(false);
         if (props.outcomeConfig.elements) {
            props.outcomeConfig.elements.nodes.forEach((ele) => {
               if (ele.data.width) {
                  cyRef.current!.$("#" + ele.data.id).style("width", ele.data.width);
               }
               if (ele.data.height) {
                  cyRef.current!.$("#" + ele.data.id).style("height", ele.data.height);
               }
            });
         }
      }); // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [cyRef.current]);

   useEffect(() => {
      if (!cyRef.current) return;
      setUpEventListeners(); // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [props.onNodeClick]);

   return (
      <CytoscapeComponent
         // must cloneDeep because CytoscapeComponent take element as pointer and try to change/remember the last state of every element.
         elements={CytoscapeComponent.normalizeElements(_.cloneDeep(props.outcomeConfig.elements || { nodes: [], edges: [] }))}
         style={{ width: "100%", height: "100%" }}
         stylesheet={stylesheet as cytoscape.Stylesheet[]}
         cy={(cy) => (cyRef.current = cy)}
      />
   );
};

export default TopologyWrapper;

import { useEffect, useRef, useState } from "react";
import { useGlobalContext } from "../../../contexts/ContextProvider";

import _ from "lodash";
import cytoscape from "cytoscape";
import AddNodeForm from "./AddNodeForm";
import AddEdgeForm from "./AddEdgeForm";
import TopologyWrapper from "../../TopologyWrapper";

import { CommitFormButtonProps, EditOutcomeProps, OutcomeSelectedElem, AddNodeParams, AddEdgeParams } from "./EditOutcomeTypes";

const CommitFormButton = (props: CommitFormButtonProps) => {
   const [isConfirmOpen, setIsConfirmOpen] = useState(false);

   const handleCommit = () => {
      if (props.shouldComfirm) {
         setIsConfirmOpen(true);
      } else {
         props.saveHandler();
      }
   };

   useEffect(() => {
      if (!props.shouldComfirm) setIsConfirmOpen(false);
   }, [props.shouldComfirm]);

   if (isConfirmOpen) {
      return (
         <div className="font-sm d-flex align-items-center">
            <span className="mx-2">
               There can be updates that have not yet been saved as you select an element. Are you certain that you want to go?
            </span>
            <button className="btn btn-primary btn-sm me-2" onClick={props.saveHandler}>
               Yes
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setIsConfirmOpen(false)}>
               No
            </button>
         </div>
      );
   } else {
      return (
         <button type="button" className="btn btn-primary btn-sm" onClick={handleCommit}>
            Commit Change
         </button>
      );
   }
};

const EditOutcome = (props: EditOutcomeProps) => {
   const cyRef = useRef<cytoscape.Core | null>(null);
   const { context, dispatch } = useGlobalContext();
   const [outcome, setOutcome] = useState({ elements: { nodes: [], edges: [] }, commands: {}, ssh: {}, ...props.initValue[0] });
   const [selectedNode, setSelectedNode] = useState<OutcomeSelectedElem | null>(null);
   const [selectedEdge, setSelectedEdge] = useState<OutcomeSelectedElem | null>(null);
   const [renderForm, setRenderForm] = useState("node");

   const getTopologyObject = () => {
      // use for return current cy object elements
      let topologyObj: { nodes: cytoscape.ElementDefinition[]; edges: cytoscape.ElementDefinition[] } = {
         nodes: [],
         edges: [],
      };
      if (!cyRef.current) return topologyObj;

      topologyObj["nodes"] = cyRef.current.nodes().map((el) => ({
         data: el.data(),
         position: el.position(),
         classes: el.classes(),
      }));
      topologyObj["edges"] = cyRef.current.edges().map((el) => ({ data: el.data(), classes: el.classes() }));
      return topologyObj;
   };

   const deleteElementHandler = () => {
      let newOutcome = _.cloneDeep(outcome);
      if (selectedNode) {
         // delete node
         newOutcome.elements.nodes = newOutcome.elements.nodes.filter((el) => {
            return el.data.id !== selectedNode.data.id;
         });
         // delete command on node
         if (newOutcome.commands[selectedNode.data.id]) {
            delete newOutcome.commands[selectedNode.data.id];
         }
         // update state
         setOutcome(newOutcome);
         setSelectedNode(null);
      } else if (selectedEdge) {
         // delete edge
         newOutcome.elements.edges = newOutcome.elements.edges.filter((el) => {
            return el.data.id !== selectedEdge.data.id;
         });
         // update state
         setOutcome(newOutcome);
         setSelectedEdge(null);
      }
   };

   const saveHandler = () => {
      if (!context.currentStep.name) return;

      let currentObjectData = getTopologyObject();
      let currentConfig = _.cloneDeep(context.config);

      currentConfig.mainContent[context.currentStep.name].outcome![0].elements = { ...currentObjectData };
      currentConfig.mainContent[context.currentStep.name].outcome![0].commands = { ...outcome.commands };
      // TODO future planning is to support multiple outcomes

      currentConfig.mainContent[context.currentStep.name].outcome![0].ssh = { ...outcome.ssh };
      dispatch({ type: "replaceConfig", payload: currentConfig });
      props.onHide();
   };

   const handleAddNode = (element: AddNodeParams, isNew = false) => {
      let id = element.data.id;
      let newOutcome = _.cloneDeep(outcome);
      let isElementExisted = newOutcome.elements.nodes.some((el) => el.data.id === id);
      let lowestX = cyRef.current?.nodes().reduce((prev, node) => {
         return node.position().x < prev ? node.position().x : prev;
      }, 10000000);
      let lowestY = cyRef.current?.nodes().reduce((prev, node) => {
         return node.position().y < prev ? node.position().y : prev;
      }, 10000000);

      let newElement = {
         data: element.data,
         classes: element.classes,
         ...(isNew && { position: { x: lowestX ? lowestX - 100 : 0, y: lowestY || 0 } }),
      };

      if (isElementExisted) {
         newOutcome.elements.nodes = newOutcome.elements.nodes.map((el) => {
            return el.data.id === id ? newElement : el;
         });
      } else {
         newOutcome.elements.nodes.push(newElement);
      }
      if (element.commands) {
         // Add command to node
         newOutcome.commands[id] = element.commands;
      } else {
         // Remove command from node
         delete newOutcome.commands[id];
      }
      if (element.ssh) {
         // Add command to node
         newOutcome.ssh[id] = element.ssh;
      } else {
         // Remove command from node
         delete newOutcome.ssh[id];
      }
      setOutcome(newOutcome);
      setSelectedNode(null);
   };

   const handleAddEdge = (element: AddEdgeParams) => {
      let id = element.data.id;
      let newOutcome = _.cloneDeep(outcome);
      let isElementExisted = newOutcome.elements.edges.some((el) => el.data.id === id);
      if (isElementExisted) {
         newOutcome.elements.edges = newOutcome.elements.edges.map((el) => {
            return el.data.id === id ? element : el;
         });
      } else {
         newOutcome.elements.edges.push(element);
      }
      setOutcome(newOutcome);
      setSelectedEdge(null);
   };

   const elementClickHandler = (element: cytoscape.SingularData) => {
      if (element.isNode()) {
         setSelectedEdge(null);
         setSelectedNode({
            data: element.data(),
            style: element.style(),
            classes: element.classes(),
            commands: outcome.commands[element.data().id],
            ssh: outcome.ssh && outcome.ssh[element.data().id] ? outcome.ssh[element.data().id] : undefined,
         });
         setRenderForm("node");
      } else if (element.isEdge()) {
         setSelectedEdge({
            data: element.data(),
            style: element.style(),
            classes: element.classes(),
            commands: outcome.commands[element.data().id],
         });
         setSelectedNode(null);
         setRenderForm("edge");
      }
   };

   let selectedElementId = "";
   if (selectedNode) {
      selectedElementId = selectedNode.data.id;
   } else if (selectedEdge) {
      selectedElementId = selectedEdge.data.id;
   }

   return (
      <>
         <div className="modal-header">
            <span className="modal-title">Outcome Editor</span>
            <button type="button" className="btn-close" onClick={props.onHide}></button>
         </div>
         <div className="modal-body overflow-auto">
            <div className="row">
               <div className="btn-group btn-group-sm col-4">
                  <button
                     type="button"
                     className={`btn btn-${renderForm === "edge" ? "outline-" : ""}secondary`}
                     onClick={() => setRenderForm("node")}
                  >
                     Node
                  </button>
                  <button
                     type="button"
                     className={`btn btn-${renderForm === "node" ? "outline-" : ""}secondary`}
                     onClick={() => setRenderForm("edge")}
                  >
                     Edge
                  </button>
               </div>
            </div>
            <div className="border rounded p-3" style={{ marginTop: "-1px" }}>
               <div className="row">
                  <div className="col-sm-4 me-auto">
                     <div className="d-flex align-items-center">
                        <div className="input-group input-group-sm">
                           <span className="input-group-text">Element ID</span>
                           <input type="text" className="form-control" disabled value={selectedElementId} />
                        </div>
                        <div className="mx-2">
                           <i
                              title="de-select"
                              className="fal fa-times-circle icon-hover-highlight pointer"
                              onClick={() => {
                                 setSelectedNode(null);
                                 setSelectedEdge(null);
                              }}
                           />
                        </div>
                     </div>
                  </div>
                  <div className="col-auto">
                     <button
                        type="button"
                        title="Delete selected element"
                        className="btn btn-danger btn-sm float-right"
                        disabled={!selectedNode && !selectedEdge}
                        onClick={deleteElementHandler}
                     >
                        Delete
                     </button>
                  </div>
               </div>
               <div className="mt-2">
                  {renderForm === "node" ? (
                     <AddNodeForm
                        onAddElement={handleAddNode}
                        nodeList={outcome.elements.nodes}
                        edgeList={outcome.elements.edges}
                        initValue={selectedNode}
                     />
                  ) : (
                     <AddEdgeForm
                        onAddElement={handleAddEdge}
                        nodeList={outcome.elements.nodes}
                        edgeList={outcome.elements.edges}
                        initValue={selectedEdge}
                     />
                  )}
               </div>
            </div>
            <div>
               <div className="p-2">
                  Preview
                  <span className="font-sm font-italic fw-light text-muted ms-3">
                     Click on the element below to edit parameters
                  </span>
               </div>
               <div className="border rounded" style={{ height: 500 }}>
                  <TopologyWrapper cy={(cy) => (cyRef.current = cy)} outcomeConfig={outcome} onNodeClick={elementClickHandler} />
               </div>
            </div>
         </div>
         <div className="modal-footer p-1">
            <button type="button" className="btn btn-sm" onClick={props.onHide}>
               Close
            </button>
            <CommitFormButton shouldComfirm={selectedEdge !== null || selectedNode !== null} saveHandler={saveHandler} />
         </div>
      </>
   );
};

export default EditOutcome;

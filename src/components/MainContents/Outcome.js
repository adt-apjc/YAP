import React, { useContext, useState } from "react";
import GlobalContext from "../contexts/ContextProvider";
import { Modal } from "../../helper/modalHelper";
import { normalRequest, pollingRequest } from "../../helper/actionHelper";
import { ValidationDetail } from "./Validations";
import _ from "lodash";
import TopologyWrapper from "./TopologyWrapper";

const CommandModal = (props) => {
   const context = useContext(GlobalContext);
   const [isRunning, setIsRunning] = useState(false);
   const [cmdResults, setCmdResults] = useState(null);
   const [action, setAction] = useState(null);

   const handleRunCommand = async () => {
      setIsRunning(true);
      try {
         let response;
         if (action && action.type === "request") {
            // normal request
            response = await normalRequest(action, context.config.endpoints);
         } else if (action && action.type === "polling") {
            // polling request
            response = await pollingRequest(action, context.config.endpoints);
         }
         // update state actionResults for specific step
         setIsRunning(false);
         setCmdResults(response);
      } catch (e) {
         console.log(e);
         // update state actionResults for specific step
         setIsRunning(false);
         setCmdResults(e);
      }
   };

   const renderCommandOptions = () => {
      let { outcomeConfig } = props;
      if (outcomeConfig.commands && outcomeConfig.commands[props.selectedElement.id]) {
         return outcomeConfig.commands[props.selectedElement.id].map((cmd, index) => {
            return (
               <option key={index} value={index}>
                  {cmd.title}
               </option>
            );
         });
      }
   };

   const selectChangeHandler = (e) => {
      let { outcomeConfig, selectedElement } = props;
      setAction({ ...outcomeConfig.commands[selectedElement.id][e.target.value] });
   };

   return (
      <div className="container-fluid">
         <div className="input-group mb-3">
            <select className="form-select" onChange={selectChangeHandler}>
               <option>Choose command to run</option>
               {renderCommandOptions()}
            </select>
            <button className="btn btn-outline-secondary" onClick={handleRunCommand}>
               {isRunning ? (
                  <>
                     Running
                     <i className="fas fa-spinner fa-spin m-1" />
                  </>
               ) : (
                  "Run"
               )}
            </button>
         </div>
         <ValidationDetail show={cmdResults ? true : false} response={cmdResults} request={action} />
      </div>
   );
};

const Outcome = (props) => {
   const [modal, setModal] = useState({ modalShow: false, selectedElement: null });

   const handleNodeClick = (nodeElement) => {
      let nodeData = nodeElement.data();
      let outcomeConfig = props.currentStepDetails.outcome;
      // check if selected node has configured commands ?
      if (outcomeConfig.commands && outcomeConfig.commands[nodeData.id]) {
         setModal({ selectedElement: nodeData, modalShow: true });
      }
   };

   const onModalHide = () => setModal({ modalShow: false, selectedElement: null });

   let outcomeConfig = props.currentStepDetails.outcome;
   if (!props.show) return null;
   if (!outcomeConfig)
      return (
         <div className="container">
            <div className="shadow-sm p-3 mb-3 bg-light text-secondary rounded">No configuration</div>
         </div>
      );

   return (
      <div className="container-fluid">
         <TopologyWrapper outcomeConfig={outcomeConfig} onNodeClick={handleNodeClick} />
         <Modal show={modal.modalShow} onHide={onModalHide}>
            <div className="modal-header">
               <span className="modal-title">{modal.selectedElement ? modal.selectedElement.id : ""}</span>
               <button type="button" className="btn-close" onClick={onModalHide}></button>
            </div>
            <div className="modal-body">
               <CommandModal selectedElement={modal.selectedElement} outcomeConfig={outcomeConfig} />
            </div>
            <div className="modal-footer">
               <button type="button" className="btn btn-secondary btn-sm" onClick={onModalHide}>
                  Close
               </button>
            </div>
         </Modal>
      </div>
   );
};

export default Outcome;

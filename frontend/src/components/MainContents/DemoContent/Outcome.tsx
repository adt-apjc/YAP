import React, { useCallback, useEffect, useState, useRef } from "react";
import { useGlobalContext } from "../../contexts/ContextProvider";
import { Modal } from "../../../helper/modalHelper";
import { normalRequest, pollingRequest } from "../../../helper/actionHelper";
import TopologyWrapper from "../TopologyWrapper";
import { OutcomeCommandConfig, OutcomeConfig, RestActionConfig, StepDetails } from "../../contexts/ContextTypes";
import cytoscape from "cytoscape";
import { AxiosResponse } from "axios";
import RestResponseDetail from "./RestResponseDetails";

type CommandModalProps = {
   outcomeConfig: OutcomeConfig;
   selectedElementData: any;
};

type OutcomeProps = {
   currentStepDetails: StepDetails;
   sectionExpand: { preCheck: boolean; action: boolean; postCheck: boolean; outcome: boolean };
};

type APIResponse = AxiosResponse & { success: boolean };

const CommandModal = (props: CommandModalProps) => {
   const { context } = useGlobalContext();
   const [isRunning, setIsRunning] = useState(false);
   const [cmdResults, setCmdResults] = useState<APIResponse | null>(null);
   const [action, setAction] = useState<OutcomeCommandConfig | null>(null);

   const handleRunCommand = async () => {
      setIsRunning(true);
      try {
         let response: APIResponse | null = null;
         if (action && action.type === "request") {
            // normal request
            response = await normalRequest(action as RestActionConfig, context.config);
         } else if (action && action.type === "polling") {
            // polling request
            response = await pollingRequest(action as RestActionConfig, context.config);
         }
         // update state actionResults for specific step
         setIsRunning(false);
         setCmdResults(response);
      } catch (e: any) {
         console.log(e);
         // update state actionResults for specific step
         setIsRunning(false);
         setCmdResults(e);
      }
   };

   const renderCommandOptions = () => {
      let { outcomeConfig } = props;
      if (outcomeConfig.commands && outcomeConfig.commands[props.selectedElementData.id]) {
         return outcomeConfig.commands[props.selectedElementData.id].map((cmd, index) => {
            return (
               <option key={index} value={index}>
                  {cmd.title}
               </option>
            );
         });
      }
   };

   const selectChangeHandler = (e: React.ChangeEvent<HTMLSelectElement>) => {
      let { outcomeConfig, selectedElementData } = props;
      let index = parseInt(e.target.value);

      if (outcomeConfig.commands && index >= 0) {
         setAction({ ...outcomeConfig.commands[selectedElementData.id][index] });
         setCmdResults(null);
      } else {
         setAction(null);
      }
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
            {props.outcomeConfig.ssh && props.outcomeConfig.ssh![props.selectedElementData.id] && (
               <button
                  className="btn btn-outline-secondary"
                  onClick={() => {
                     let params = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=800,height=500`;
                     window.open(
                        `/#/ssh?selectedElementId=${props.selectedElementData.id}&&stepId=${context.currentStep.name}`,
                        props.selectedElementData.id,
                        params,
                     );
                  }}
               >
                  SSH
               </button>
            )}
         </div>
         {action !== null && <RestResponseDetail show={true} response={cmdResults} request={action as RestActionConfig} />}
      </div>
   );
};

const Outcome = (props: OutcomeProps) => {
   const cyRef = useRef<cytoscape.Core | null>(null);
   const [modal, setModal] = useState<{ modalShow: boolean; selectedElementData: any }>({
      modalShow: false,
      selectedElementData: null,
   });
   const [collapseCount, setCollapseCount] = useState(0);

   const handleNodeClick = useCallback(
      (nodeElement: cytoscape.NodeSingular) => {
         if (!props.currentStepDetails.outcome) return;

         let nodeData = nodeElement.data();
         let outcomeConfig = props.currentStepDetails.outcome[0];
         // check if selected node has configured commands ?
         if (
            (outcomeConfig.commands && outcomeConfig.commands[nodeData.id]) ||
            (outcomeConfig.ssh && outcomeConfig.ssh[nodeData.id])
         ) {
            setModal({ selectedElementData: nodeData, modalShow: true });
         }
      }, // eslint-disable-next-line react-hooks/exhaustive-deps
      [JSON.stringify(props.currentStepDetails)],
   );

   const onModalHide = () => setModal({ modalShow: false, selectedElementData: null });

   useEffect(() => {
      setCollapseCount((prev) => prev + 1);
   }, [props.sectionExpand]);

   // TODO future planning is to support multiple outcomes
   let outcomeConfig = props.currentStepDetails.outcome && props.currentStepDetails.outcome[0];
   if (!props.sectionExpand.outcome) return null;
   if (!outcomeConfig)
      return (
         <div className="container">
            <div className="shadow-sm p-3 mb-3 bg-light text-secondary rounded">No configuration</div>
         </div>
      );

   return (
      <div className="container-fluid" style={{ height: 500 + (collapseCount % 2) }}>
         <TopologyWrapper cy={(cy) => (cyRef.current = cy)} outcomeConfig={outcomeConfig} onNodeClick={handleNodeClick} />
         <Modal show={modal.modalShow} onHide={onModalHide}>
            <div className="modal-header">
               <span className="modal-title">{modal.selectedElementData ? modal.selectedElementData.label : ""}</span>
               <button type="button" className="btn-close" onClick={onModalHide}></button>
            </div>
            <div className="modal-body">
               <CommandModal selectedElementData={modal.selectedElementData} outcomeConfig={outcomeConfig} />
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

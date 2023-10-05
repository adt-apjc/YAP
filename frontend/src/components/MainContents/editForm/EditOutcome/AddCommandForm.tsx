import React, { useEffect, useState } from "react";
import { useGlobalContext } from "../../../contexts/ContextProvider";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import WithDropdown from "../../../Popper/Dropdown";
import AceEditor from "react-ace";
import "ace-builds/webpack-resolver";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-github";
import _ from "lodash";

import { OutcomeCommandConfig } from "../../../contexts/ContextTypes";
import { AddCommandFormProps, CloneCommandSelectorProps } from "./EditOutcomeTypes";

const CloneCommandSelector = (props: CloneCommandSelectorProps) => {
   const { context } = useGlobalContext();
   const [selectedStep, setSelectStep] = useState<string>(context.currentStep.name as string);
   let { outcome } = context.config.mainContent[selectedStep];

   const handleSelectElement = (el: { id: string; label: string }) => {
      if (!outcome || !outcome[0].commands || !outcome[0].commands[el.id]) return;

      let targetCommand = _.cloneDeep(outcome[0].commands[el.id]).map((c) => ({
         ...c,
         data: JSON.stringify(c.data, null, 3), //data must be string because AceEditor require string.
      }));

      props.setCommands((prev) => [...prev, ...targetCommand]);
      props.close();
   };

   let nodeItems = outcome
      ? outcome[0].elements?.nodes.map((n) => ({
           id: n.data.id || "",
           label: n.data.label,
        }))
      : undefined;
   nodeItems = nodeItems?.filter((n) => outcome![0].commands![n.id] !== undefined && n.id !== props.selectElementId);

   return (
      <div className="p-2">
         <div className="d-flex">
            <div>
               <div className="fw-light font-sm mb-2">Select step</div>
               {context.config.sidebar && (
                  <ul className="list-group font-sm">
                     {context.config.sidebar.map((el) => (
                        <li
                           key={el.name}
                           className={`pointer list-group-item list-group-item-action ${
                              el.name === selectedStep ? "active" : ""
                           }`}
                           onClick={() => setSelectStep(el.name)}
                        >
                           {el.label ? el.label : "NO-LABEL"}
                        </li>
                     ))}
                  </ul>
               )}
            </div>
            <i className="m-auto mx-2 fas fa-caret-right" />
            <div>
               <div className="fw-light font-sm mb-2">Select node</div>
               <ul className="list-group font-sm">
                  {nodeItems?.map((el) => (
                     <li
                        key={el.id}
                        className="pointer list-group-item list-group-item-action"
                        onClick={() => handleSelectElement(el)}
                     >
                        {el.label ? el.label : "NO-LABEL"}
                     </li>
                  ))}
               </ul>
            </div>
         </div>
      </div>
   );
};

const AddCommandForm = (props: AddCommandFormProps) => {
   const [data, setData] = useState("");
   const [selectedCommandIndex, setSelectedCommandIndex] = useState<number | null>(null);
   const { context } = useGlobalContext();

   const transformPayloadTextToObject = () => {
      try {
         if (data === "") return undefined;
         let obj = JSON.parse(data);
         return obj;
      } catch (err) {
         return false;
      }
   };

   const handleBeautify = () => {
      let payload = transformPayloadTextToObject();
      if (payload) setData(JSON.stringify(payload, null, 3));
   };

   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      if (selectedCommandIndex === null) return;

      let newCommands = _.cloneDeep(props.commands);
      newCommands[selectedCommandIndex][e.target.name as keyof OutcomeCommandConfig] = e.target.value;
      props.setCommands(newCommands);
   };

   const handleDeleteCommand = (e: React.MouseEvent, index: number) => {
      e.stopPropagation();
      let newCommands = _.cloneDeep(props.commands);
      if (selectedCommandIndex === index) {
         setData("");
         setSelectedCommandIndex(null);
      } else if (selectedCommandIndex && selectedCommandIndex > index) setSelectedCommandIndex((prev) => prev! - 1);

      newCommands.splice(index, 1);
      props.setCommands(newCommands);
   };

   const handleAddNewCommand = () => {
      setData("");
      setSelectedCommandIndex(props.commands.length);
      props.setCommands((prev) => [
         ...prev,
         {
            type: "request",
            useEndpoint: "",
            title: "",
            url: "",
            method: "get",
            displayResponseAs: "json",
            objectPath: "",
            data: undefined,
            expect: [],
         },
      ]);
   };

   const handleDragEnd = (result: DropResult) => {
      if (!result.destination) {
         return;
      }
      if (result.destination.index === result.source.index) {
         return;
      }
      // reorder
      const cmds = _.cloneDeep(props.commands);
      const [removed] = cmds.splice(result.source.index, 1);
      cmds.splice(result.destination.index, 0, removed);
      props.setCommands(cmds);
   };

   const handleDragStart = () => {
      setSelectedCommandIndex(null);
   };

   const renderCommand = () => {
      return props.commands.map((el, index) => {
         return (
            <Draggable draggableId={`cmd-${index}`} index={index} key={index}>
               {(provided) => (
                  <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                     <div
                        key={index}
                        className={`d-flex btn btn-sm btn${selectedCommandIndex === index ? "" : "-outline"}-info me-2`}
                        onClick={() => {
                           if (typeof el.data === "object") setData(JSON.stringify(el.data, null, 3));
                           else setData(el.data);
                           setSelectedCommandIndex(index);
                        }}
                     >
                        <span className="me-2">{el.title}</span>
                        <span>
                           <i
                              title="delete"
                              className="fal fa-times-circle icon-hover-highlight pointer"
                              onClick={(e) => handleDeleteCommand(e, index)}
                           />
                        </span>
                     </div>
                  </div>
               )}
            </Draggable>
         );
      });
   };

   const renderEndpointOptions = () => {
      if (!context.config.endpoints) return;

      return Object.keys(context.config.endpoints).map((el, index) => {
         return (
            <option key={index} value={el}>
               {el}
            </option>
         );
      });
   };

   useEffect(() => {
      if (selectedCommandIndex === null) return;

      let newCommands = _.cloneDeep(props.commands);
      newCommands[selectedCommandIndex].data = !data ? undefined : data;
      props.setCommands(newCommands);

      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [data]);

   useEffect(() => {
      setSelectedCommandIndex(null);
   }, [props.nodeId]);

   return (
      <div className="bg-light rounded-lg mb-1">
         <div className="d-flex justify-content-between">
            <div className="px-2 py-1">Command</div>
            <div className="px-2 py-1">
               <input
                  className="form-check-input"
                  type="checkbox"
                  title="enable command"
                  name="enableCommand"
                  checked={props.enableCommand}
                  onChange={() => props.setEnableCommand((prev) => !prev)}
               />
            </div>
         </div>
         {props.enableCommand && (
            <div className="px-4 pb-2 border-top">
               <div className="row my-1">
                  <div className="col-sm-12">
                     <span className="font-sm">
                        You can add new command using <span className="fw-bold">+</span> <span className="fst-italic">or</span>{" "}
                        <span className="fw-bold">import</span> from the other element
                     </span>
                  </div>
               </div>
               <div className="row my-2">
                  <div className="col-sm-12 col-md-2">
                     <div className="btn-group">
                        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={handleAddNewCommand}>
                           <span className="px-1">+</span>
                        </button>
                        <WithDropdown
                           className="btn btn-sm btn-outline-secondary"
                           interactive
                           bindToRoot
                           placement="right"
                           DropdownComponent={(close) => (
                              <CloneCommandSelector
                                 selectElementId={props.nodeId}
                                 close={close}
                                 setCommands={props.setCommands}
                              />
                           )}
                        >
                           Import
                        </WithDropdown>
                     </div>
                  </div>
                  <div className="col-sm-12 col-md-10">
                     <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
                        <Droppable droppableId="cmd-drap-area" direction="horizontal">
                           {(provided) => (
                              <div className="d-flex overflow-auto" ref={provided.innerRef} {...provided.droppableProps}>
                                 {renderCommand()}
                                 {provided.placeholder}
                              </div>
                           )}
                        </Droppable>
                     </DragDropContext>
                  </div>
               </div>

               {selectedCommandIndex !== null && props.commands[selectedCommandIndex] && (
                  <>
                     <div className="row">
                        <div className="col">
                           <div className="form-check form-check-inline">
                              <input
                                 className="form-check-input"
                                 type="radio"
                                 name="type"
                                 id="inlineRadio1"
                                 value="request"
                                 checked={props.commands[selectedCommandIndex].type === "request"}
                                 onChange={handleInputChange}
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
                                 checked={props.commands[selectedCommandIndex].type === "polling"}
                                 onChange={handleInputChange}
                              />
                              <label className="form-check-label" htmlFor="inlineRadio2">
                                 polling
                              </label>
                           </div>
                        </div>
                        <div className="col">
                           <select
                              className="form-select form-select-sm"
                              name="useEndpoint"
                              onChange={handleInputChange}
                              value={props.commands[selectedCommandIndex].useEndpoint}
                           >
                              <option value="">Choose endpoint...</option>
                              {renderEndpointOptions()}
                           </select>
                        </div>
                     </div>
                     <div className="input-group my-2">
                        <select
                           style={{ maxWidth: 150 }}
                           className="form-select"
                           name="method"
                           value={props.commands[selectedCommandIndex].method}
                           onChange={handleInputChange}
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
                           value={props.commands[selectedCommandIndex].url}
                           onChange={handleInputChange}
                        />
                     </div>
                     <div className="row mb-2">
                        <div className="col">
                           <input
                              required
                              type="text"
                              className="form-control form-control-sm"
                              name="title"
                              placeholder="title text"
                              value={props.commands[selectedCommandIndex].title}
                              onChange={handleInputChange}
                           />
                        </div>
                     </div>
                     <div className="row mb-3">
                        <div className="col-sm-12 col-md-2">DisplayResponseAs</div>
                        <div className="col-sm-12 col-md-3">
                           <select
                              className="form-select form-select-sm"
                              name="displayResponseAs"
                              value={props.commands[selectedCommandIndex].displayResponseAs}
                              onChange={handleInputChange}
                           >
                              <option value="json">JSON</option>
                              <option value="text">PLAIN TEXT</option>
                           </select>
                        </div>
                        {props.commands[selectedCommandIndex].displayResponseAs === "text" && (
                           <div className="col-sm-12 col-md-7">
                              <input
                                 type="text"
                                 className="form-control form-control-sm"
                                 name="objectPath"
                                 placeholder="objectPath"
                                 value={props.commands[selectedCommandIndex].objectPath}
                                 onChange={handleInputChange}
                              />
                           </div>
                        )}
                     </div>
                     {props.commands[selectedCommandIndex].type === "polling" && (
                        <div className="row mb-3">
                           <div className="col">
                              <input
                                 type="text"
                                 className="form-control form-control-sm"
                                 name="maxRetry"
                                 placeholder="maxRetry default = 10"
                                 value={props.commands[selectedCommandIndex].maxRetry}
                                 onChange={handleInputChange}
                              />
                           </div>
                           <div className="col">
                              <input
                                 type="text"
                                 className="form-control form-control-sm"
                                 name="interval"
                                 placeholder="Interval default = 5000ms"
                                 value={props.commands[selectedCommandIndex].interval}
                                 onChange={handleInputChange}
                              />
                           </div>
                        </div>
                     )}
                     <div className="row">
                        <div className="col">
                           <div className="d-flex align-items-center mb-1">
                              <span className="me-2 font-sm">Payload (optional)</span>
                              <span className="text-hover-highlight primary font-sm ms-auto pointer" onClick={handleBeautify}>
                                 Beautify
                              </span>
                           </div>

                           <AceEditor
                              mode="json"
                              theme="github"
                              height="300px"
                              width="100%"
                              value={data ? data : ""}
                              onChange={setData}
                              name="data"
                              className="rounded border"
                              editorProps={{ $blockScrolling: true }}
                              showPrintMargin={false}
                           />
                        </div>
                     </div>
                  </>
               )}
            </div>
         )}
      </div>
   );
};

export default AddCommandForm;

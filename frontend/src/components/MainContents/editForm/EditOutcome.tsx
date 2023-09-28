import React, { useEffect, useRef, useState } from "react";
import { useGlobalContext } from "../../contexts/ContextProvider";
import TopologyWrapper from "../TopologyWrapper";
import AceEditor from "react-ace";
import "ace-builds/webpack-resolver";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-github";
import _ from "lodash";
import { NODE_APPEARANCE_OPTIONS, NODE_LABEL_CLASS_OPTIONS } from "../../contexts/Utility";
import { OutcomeCommandConfig, OutcomeConfig, SSHConfig } from "../../contexts/ContextTypes";
import cytoscape from "cytoscape";

type EditOutcomeProps = {
   onHide: () => void;
   initValue: OutcomeConfig[];
};

type OutcomeSelectedElem = {
   data: any;
   style: cytoscape.CssStyleDeclaration;
   classes: string[];
   commands?: OutcomeCommandConfig[];
   ssh?: SSHConfig;
};

type AddNodeParams = {
   data: {
      id: string;
      label: string;
      width: string;
      height: string;
      imglink?: string;
   };
   classes: string;
   commands?: OutcomeCommandConfig[];
   ssh?: SSHConfig;
};

type AddEdgeParams = {
   data: {
      id: string;
      source: string;
      target: string;
      label: string;
   };
   classes: string;
};

type AddEdgeFormProps = {
   onAddElement: (elem: AddEdgeParams) => void;
   nodeList: cytoscape.ElementDefinition[];
   edgeList: cytoscape.ElementDefinition[];
   initValue: OutcomeSelectedElem | null;
};

type AddNodeFormProps = {
   onAddElement: (elem: AddNodeParams, isNew?: boolean) => void;
   nodeList: cytoscape.ElementDefinition[];
   edgeList: cytoscape.ElementDefinition[];
   initValue: OutcomeSelectedElem | null;
};

type AddCommandFormProps = {
   nodeId: string;
   enableCommand: boolean;
   setEnableCommand: React.Dispatch<React.SetStateAction<boolean>>;
   commands: OutcomeCommandConfig[];
   setCommands: React.Dispatch<React.SetStateAction<OutcomeCommandConfig[]>>;
};

type AddSSHInfoFormProps = {
   nodeId: string;
   enableSSH: boolean;
   setEnableSSH: React.Dispatch<React.SetStateAction<boolean>>;
   sshInfo: SSHConfig;
   setSSHinfo: React.Dispatch<React.SetStateAction<SSHConfig>>;
};

type CommitFormButtonProps = {
   shouldComfirm: boolean;
   saveHandler: () => void;
};

const AddSSHInfoForm = (props: AddSSHInfoFormProps) => {
   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      props.setSSHinfo((prev) => ({ ...prev, [e.target.name]: e.target.value }));
   };

   return (
      <div className="bg-light rounded-lg mb-1">
         <div className="d-flex justify-content-between">
            <div className="px-2 py-1">SSH</div>
            <div className="px-2 py-1">
               <input
                  className="form-check-input"
                  type="checkbox"
                  title="enable command"
                  name="enableCommand"
                  checked={props.enableSSH}
                  onChange={() => props.setEnableSSH((prev) => !prev)}
               />
            </div>
         </div>
         {props.enableSSH && (
            <div className="px-4 py-2 border-top">
               <div className="row">
                  <div className="col-sm-12 col-md-4">
                     <label>Hostname</label>
                     <input
                        required
                        className="form-control form-control-sm"
                        type="text"
                        name="hostname"
                        value={props.sshInfo.hostname}
                        onChange={handleInputChange}
                     />
                  </div>
                  <div className="col-sm-12 col-md-4">
                     <label>Username</label>
                     <input
                        required
                        className="form-control form-control-sm"
                        type="text"
                        name="username"
                        value={props.sshInfo.username}
                        onChange={handleInputChange}
                     />
                  </div>
                  <div className="col-sm-12 col-md-4">
                     <label>Password</label>
                     <input
                        required
                        className="form-control form-control-sm"
                        type="text"
                        name="password"
                        value={props.sshInfo.password}
                        onChange={handleInputChange}
                     />
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

const AddCommandForm = (props: AddCommandFormProps) => {
   const [data, setData] = useState("");
   const [isPayloadValid, setIsPayloadValid] = useState(true);
   const [selectedCommandIndex, setSelectedCommandIndex] = useState<number | null>(null);
   const { context } = useGlobalContext();

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

   const renderCommand = () => {
      return props.commands.map((el, index) => {
         return (
            <div
               key={index}
               className={`d-flex btn btn-sm btn${selectedCommandIndex === index ? "" : "-outline"}-info me-2`}
               onClick={() => {
                  setData(JSON.stringify(el.data, null, 4));
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
      try {
         if (!selectedCommandIndex) return;

         let newCommands = _.cloneDeep(props.commands);
         newCommands[selectedCommandIndex].data = !data ? undefined : JSON.parse(data);
         props.setCommands(newCommands);
         setIsPayloadValid(true);
      } catch (e) {
         setIsPayloadValid(false);
      }
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
               <div className="row">
                  <div className="col-sm-12 col-md-1">
                     <div className="btn btn-sm btn-secondary px-4 me-1 my-3" onClick={handleAddNewCommand}>
                        +
                     </div>
                  </div>
                  <div className="col-sm-12 col-md-11">
                     <div className="d-flex overflow-auto my-3">{renderCommand()}</div>
                  </div>
               </div>
               {selectedCommandIndex !== null && (
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
                           <div>
                              <span className="me-2 font-sm">Payload (optional)</span>
                              {!isPayloadValid ? "invalid JSON" : ""}
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

const AddNodeForm = (props: AddNodeFormProps) => {
   const [input, setInput] = useState({
      id: "",
      label: "",
      type: "default",
      width: "50",
      height: "50",
      highlight: false,
      labelClass: "",
      iconLink: "",
   });
   const [commands, setCommands] = useState<OutcomeCommandConfig[]>([]);
   const [enableCommand, setEnableCommand] = useState(false);
   const [enableSSH, setEnableSSH] = useState(false);
   const [isIconLinkChecked, setIsIconLinkChecked] = useState(false);
   const [sshInfo, setSSHInfo] = useState<SSHConfig>({ hostname: "", username: "", password: "" });

   const renderLabelClassOptions = () => {
      const sortedArr = NODE_LABEL_CLASS_OPTIONS.sort((a, b) => a["label"].localeCompare(b["label"]));

      return (
         <>
            {sortedArr.map((item, i) => {
               return (
                  <option key={i} value={`${item.value}`}>
                     {item.label}
                  </option>
               );
            })}
         </>
      );
   };

   const renderAppearanceOptions = () => {
      const sortedArr = NODE_APPEARANCE_OPTIONS.sort((a, b) => a["label"].localeCompare(b["label"]));

      return (
         <>
            {sortedArr.map((item, i) => {
               return (
                  <option key={i} value={`${item.value}`}>
                     {item.label}
                  </option>
               );
            })}
         </>
      );
   };

   const clearInputbox = () => {
      setInput({
         id: "",
         label: "",
         type: "default",
         width: "50",
         height: "50",
         highlight: false,
         labelClass: "",
         iconLink: "",
      });
      setIsIconLinkChecked(false);
      setEnableCommand(false);
      setEnableSSH(false);
   };

   const handleFormAddNodeSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      // add node to topology
      let uuid = Math.abs((Math.random() * 0xffffffff) | 0).toString(16);
      let nodeObject: AddNodeParams = {
         data: {
            id: input.id ? input.id : uuid,
            label: input.label,
            width: input.width,
            height: input.height,
         },
         classes: `${isIconLinkChecked ? "" : input.type} ${input.highlight ? "highlight" : ""} ${
            input.labelClass ? input.labelClass : ""
         }`,
      };

      if (isIconLinkChecked && input.iconLink) {
         nodeObject.data.imglink = input.iconLink;
         nodeObject.classes += " iconLink";
      }

      if (enableCommand) {
         // enable command
         nodeObject.commands = commands;
      } else {
         // disable command
         nodeObject.commands = undefined;
      }

      if (enableSSH) {
         nodeObject.ssh = sshInfo;
      } else {
         nodeObject.ssh = undefined;
      }

      console.log(nodeObject);
      props.onAddElement(nodeObject, props.initValue === null);
      clearInputbox();
   };

   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setInput((prev) => ({ ...prev, [e.target.name]: e.target.value }));

   const handleInputCheck = (e: React.ChangeEvent<HTMLInputElement>) =>
      setInput((prev) => ({ ...prev, [e.target.name]: e.target.checked }));

   useEffect(() => {
      let { initValue } = props;
      if (!initValue) {
         clearInputbox();
      } else {
         let classesArray = [...initValue.classes];
         let index = classesArray.indexOf("highlight");
         if (index > -1) {
            classesArray.splice(index, 1);
         }

         let type = [...NODE_APPEARANCE_OPTIONS, { value: "default", label: "default" }].find((el) =>
            classesArray.includes(el.value)
         );
         let labelClass = NODE_LABEL_CLASS_OPTIONS.find((el) => classesArray.includes(el.value));
         // init icon link check
         if (type) setIsIconLinkChecked(false);
         else setIsIconLinkChecked(true);
         // init node default value
         setInput({
            id: initValue.data.id,
            label: initValue.data.label,
            type: type ? type.value : "default",
            width: initValue.style.width,
            height: initValue.style.height,
            highlight: initValue.classes.includes("highlight"),
            labelClass: labelClass ? labelClass.value : "",
            iconLink: type ? "" : initValue.style.backgroundImage,
         });
         // init command form
         if (initValue.commands) {
            setCommands(initValue.commands);
            setEnableCommand(true);
         } else {
            setCommands([]);
            setEnableCommand(false);
         }
         // init ssh form
         if (initValue.ssh) {
            setSSHInfo({ ...initValue.ssh });
            setEnableSSH(true);
         } else {
            setSSHInfo({ hostname: "", username: "", password: "" });
            setEnableSSH(false);
         }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [JSON.stringify(props.initValue)]);

   useEffect(() => {
      if (isIconLinkChecked) setInput((prev) => ({ ...prev, type: "default" }));
      else setInput((prev) => ({ ...prev, iconLink: "" }));
   }, [isIconLinkChecked]);

   useEffect(() => {
      if (input.type === "text") setInput((prev) => ({ ...prev, labelClass: "labelCenter" }));
   }, [input.type]);

   const renderBuiltInIconPreview = () => {
      let hideFromList = ["default", "text"];

      if (hideFromList.includes(input.type)) return null;

      return (
         <div className="flex-grow-1 text-center mt-2">
            <img src={` assets/${input.type}.png`} alt={input.type} width="50px" height="50px"></img>
         </div>
      );
   };

   return (
      <form onSubmit={handleFormAddNodeSubmit} id="addNodeForm">
         <div className="form-group">
            <div className="row">
               <div className="col-sm-3">
                  <label>Label</label>
                  <input
                     type="text"
                     className="form-control form-control-sm"
                     placeholder="label"
                     name="label"
                     value={input.label}
                     onChange={handleInputChange}
                  />
               </div>
               <div className="col-sm-3">
                  <label>Label position</label>
                  <select
                     className="form-select form-select-sm"
                     name="labelClass"
                     value={input.labelClass}
                     onChange={handleInputChange}
                  >
                     <option value="labelTop">Top</option>
                     {renderLabelClassOptions()}
                  </select>
               </div>
               <div className="col-sm-4">
                  <label>
                     Size <span className="font-sm">(Width x Height)</span>
                  </label>
                  <div className="input-group input-group-sm mb-3">
                     <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Width"
                        required
                        name="width"
                        value={input.width}
                        onChange={handleInputChange}
                     />
                     <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Height"
                        required
                        name="height"
                        value={input.height}
                        onChange={handleInputChange}
                     />
                  </div>
               </div>
               <div className="col-sm-2">
                  <div className="d-flex align-items-center mt-4">
                     <input
                        className="form-check-input"
                        type="checkbox"
                        id="hilight"
                        name="highlight"
                        checked={input.highlight}
                        onChange={handleInputCheck}
                     />
                     <label className="form-check-label ms-2" htmlFor="hilight">
                        Highlight
                     </label>
                  </div>
               </div>
            </div>
         </div>
         <div className="row mb-3">
            <div className="col-6">
               <div className="d-flex justify-content-between aling-items-center">
                  <div className="flex-grow-1">
                     <label>Built-In Icon</label>
                     <select
                        disabled={isIconLinkChecked}
                        className="form-select form-select-sm"
                        name="type"
                        value={input.type}
                        onChange={handleInputChange}
                     >
                        <option value="default">Default</option>
                        {renderAppearanceOptions()}
                     </select>
                  </div>
                  {renderBuiltInIconPreview()}
               </div>
            </div>
            <div className="col-6">
               <div className="d-flex">
                  <input
                     id="iconLinkCheckbox"
                     type="checkbox"
                     className="form-check-input"
                     checked={isIconLinkChecked}
                     onChange={(e) => setIsIconLinkChecked(e.target.checked)}
                  />
                  <label className="ms-2" htmlFor="iconLinkCheckbox">
                     Icon Link
                  </label>
               </div>
               <input
                  required={isIconLinkChecked}
                  name="iconLink"
                  disabled={!isIconLinkChecked}
                  className="form-control form-control-sm"
                  value={input.iconLink}
                  onChange={handleInputChange}
               />
            </div>
         </div>
         <AddSSHInfoForm
            nodeId={input.id}
            enableSSH={enableSSH}
            setEnableSSH={setEnableSSH}
            sshInfo={sshInfo}
            setSSHinfo={setSSHInfo}
         />
         <AddCommandForm
            nodeId={input.id}
            enableCommand={enableCommand}
            setEnableCommand={setEnableCommand}
            commands={commands}
            setCommands={setCommands}
         />
         <button type="submit" className="btn btn-sm btn-primary my-1" form="addNodeForm">
            {props.initValue ? "Update" : "Add"}
         </button>
      </form>
   );
};

const AddEdgeForm = (props: AddEdgeFormProps) => {
   const [input, setInput] = useState({
      id: "",
      source: "",
      target: "",
      label: "",
      highlight: false,
      dashed: false,
      curveline: false,
   });

   const clearInputbox = () => {
      setInput({ id: "", source: "", target: "", label: "", highlight: false, dashed: false, curveline: false });
   };

   const renderNodeSelectOption = () => {
      if (!props.nodeList) return;

      return props.nodeList.map((el, index) => {
         return (
            <option key={index} value={el.data.id}>
               {el.data.label}
            </option>
         );
      });
   };

   const handleAddEdge = (e: React.FormEvent) => {
      e.preventDefault();
      let uuid = Math.abs((Math.random() * 0xffffffff) | 0).toString(16);
      let edgeObject = {
         data: {
            id: input.id ? input.id : uuid,
            source: input.source,
            target: input.target,
            label: input.label !== null ? input.label : "",
         },
         classes: `${input.highlight ? "highlight" : ""} ${input.curveline ? "curve-multiple" : ""} ${
            input.dashed ? "dashed" : ""
         }`,
      };
      props.onAddElement(edgeObject);
      clearInputbox();
   };

   const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) =>
      setInput((prev) => ({ ...prev, [e.target.name]: e.target.value }));
   const handleInputCheck = (e: React.ChangeEvent<HTMLInputElement>) =>
      setInput((prev) => ({ ...prev, [e.target.name]: e.target.checked }));

   useEffect(() => {
      let { initValue } = props;
      if (!initValue) {
         clearInputbox();
      } else
         setInput({
            id: initValue.data.id,
            source: initValue.data.source,
            target: initValue.data.target,
            label: initValue.data.label || "",
            highlight: initValue.classes.includes("highlight"),
            dashed: initValue.classes.includes("dashed"),
            curveline: initValue.classes.includes("curve-multiple"),
         });
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [JSON.stringify(props.initValue)]);

   return (
      <form onSubmit={handleAddEdge}>
         <div className="form-group">
            <div className="row">
               <div className="col-sm-3">
                  <label>Source</label>
                  <select
                     className="form-select form-select-sm"
                     required
                     name="source"
                     value={input.source}
                     onChange={handleInputChange}
                  >
                     <option value="">Choose...</option>
                     {renderNodeSelectOption()}
                  </select>
               </div>
               <div className="col-sm-3">
                  <label>Target</label>
                  <select
                     className="form-select form-select-sm"
                     required
                     name="target"
                     value={input.target}
                     onChange={handleInputChange}
                  >
                     <option value="">Choose...</option>
                     {renderNodeSelectOption()}
                  </select>
               </div>
               <div className="col-sm-3">
                  <label>Label (optional)</label>
                  <input
                     type="text"
                     className="form-control form-control-sm"
                     placeholder="label"
                     name="label"
                     value={input.label}
                     onChange={handleInputChange}
                  />
               </div>
               <div className="col-sm-2 ms-3">
                  <label>Appearance</label>
                  <div className="form-check">
                     <input
                        className="form-check-input"
                        type="checkbox"
                        id="highlight-checkbox"
                        name="highlight"
                        checked={input.highlight}
                        onChange={handleInputCheck}
                     />
                     <label className="form-check-label" htmlFor="highlight-checkbox">
                        Highlight
                     </label>
                  </div>
                  <div className="form-check">
                     <input
                        className="form-check-input"
                        type="checkbox"
                        id="dashed-checkbox"
                        name="dashed"
                        checked={input.dashed}
                        onChange={handleInputCheck}
                     />
                     <label className="form-check-label" htmlFor="dashed-checkbox">
                        Dashed
                     </label>
                  </div>
                  <div className="form-check">
                     <input
                        className="form-check-input"
                        type="checkbox"
                        id="curve-line-checkbox"
                        name="curveline"
                        checked={input.curveline}
                        onChange={handleInputCheck}
                     />
                     <label className="form-check-label" htmlFor="curve-line-checkbox">
                        Curve line
                     </label>
                  </div>
               </div>
            </div>
         </div>
         <button type="submit" className="btn btn-sm btn-primary my-1">
            {props.initValue ? "Update" : "Add"}
         </button>
      </form>
   );
};

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

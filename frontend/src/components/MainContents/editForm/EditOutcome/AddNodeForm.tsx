import React, { useEffect, useState } from "react";

import _ from "lodash";
import AddCommandForm from "./AddCommandForm";
import AddSSHInfoForm from "./SSHForm";
import NestedNodeForm from "./NestNodeForm";

import { OutcomeCommandConfig, SSHConfig } from "../../../contexts/ContextTypes";
import { NODE_APPEARANCE_OPTIONS, NODE_LABEL_CLASS_OPTIONS } from "../../../contexts/Utility";
import { AddNodeFormProps, AddNodeParams } from "./EditOutcomeTypes";

const DEFAULT_FORM_VALUE = {
   id: "",
   label: "",
   type: "default",
   width: "50",
   height: "50",
   highlight: false,
   labelClass: "",
   iconLink: "",
   parent: "",
};

const DEFAULT_SSH_INFO = {
   hostname: "",
   username: "",
   password: "",
   port: "22",
   sshkey: "",
   keyFilename: "",
};

const AddNodeForm = (props: AddNodeFormProps) => {
   const [input, setInput] = useState(DEFAULT_FORM_VALUE);
   const [commands, setCommands] = useState<OutcomeCommandConfig[]>([]);
   const [enableCommand, setEnableCommand] = useState(false);
   const [enableSSH, setEnableSSH] = useState(false);
   const [enableNested, setEnableNested] = useState(false);
   const [isIconLinkChecked, setIsIconLinkChecked] = useState(false);
   const [sshInfo, setSSHInfo] = useState<SSHConfig>(DEFAULT_SSH_INFO);
   const [isCommandDataValid, setIsCommandDataValid] = useState(true);

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

   const renderBuiltInIconPreview = () => {
      let hideFromList = ["default", "text"];

      if (hideFromList.includes(input.type)) return null;

      return (
         <div className="flex-grow-1 text-center mt-2">
            <img src={` assets/${input.type}.png`} alt={input.type} width="50px" height="50px"></img>
         </div>
      );
   };

   const clearInputbox = () => {
      setInput(DEFAULT_FORM_VALUE);
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
            parent: input.parent ? input.parent : undefined,
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
         nodeObject.commands = commands.map((command) => {
            try {
               // transform command data from string to object
               if (command.data) command.data = JSON.parse(command.data);
            } catch (err) {
               command.data = undefined;
            }
            return command;
         });
      } else {
         // disable command
         nodeObject.commands = undefined;
      }

      if (enableSSH) {
         let sshConfigObj = { ...sshInfo };
         if (!sshConfigObj.password) delete sshConfigObj.password;
         if (!sshConfigObj.sshkey) delete sshConfigObj.sshkey;
         nodeObject.ssh = sshConfigObj;
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
            classesArray.includes(el.value),
         );
         let labelClass = NODE_LABEL_CLASS_OPTIONS.find((el) => classesArray.includes(el.value));
         // init icon link check
         // if "type"/class exist OR no icon link,
         // disable icon link check box and enable built-in icon
         if (type || initValue.style.backgroundImage === "none") setIsIconLinkChecked(false);
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
            parent: initValue.data.id ? initValue.data.parent : "",
         });
         // init command form
         if (initValue.commands) {
            let clonedCmds = _.cloneDeep(initValue.commands);
            clonedCmds = clonedCmds.map((c) => ({ ...c, data: JSON.stringify(c.data, null, 3) }));
            setCommands(clonedCmds);
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
            setSSHInfo(DEFAULT_SSH_INFO);
            setEnableSSH(false);
         }
         // init parent node
         if (initValue.data.parent) setEnableNested(true);
         else setEnableNested(false);
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

   useEffect(() => {
      for (let command of commands) {
         try {
            if (command.data && typeof command.data === "string") JSON.parse(command.data);
            setIsCommandDataValid(true);
         } catch (e) {
            setIsCommandDataValid(false);
            return;
         }
      }
   }, [commands]);

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
         <NestedNodeForm
            parent={input.parent}
            onParentChange={(e) => setInput((prev) => ({ ...prev, parent: e.target.value }))}
            nodeList={props.nodeList.filter((n) => n.data.id !== input.id)}
            enableNested={enableNested}
            setEnableNested={setEnableNested}
         />
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
         {!isCommandDataValid && <div className="mt-2 font-sm">Payload invalid</div>}
         <div className="mt-3 d-flex justify-content-between">
            <div>
               <button type="submit" className="btn btn-sm btn-primary" form="addNodeForm" disabled={!isCommandDataValid}>
                  {props.initValue ? "Update" : "Add"}
               </button>
               {props.initValue && (
                  <button
                     className="btn btn-sm ms-2"
                     onClick={(e) => {
                        e.preventDefault();
                        props.onDeSelect();
                     }}
                  >
                     Cancel
                  </button>
               )}
            </div>
            {props.initValue && (
               <button
                  type="button"
                  title="Delete selected element"
                  className="btn btn-outline-danger btn-sm"
                  onClick={props.onDeleteElement}
               >
                  <i className="fas fa-trash me-1" /> Delete
               </button>
            )}
         </div>
      </form>
   );
};

export default AddNodeForm;

import { useEffect, useState } from "react";

import { AddSSHInfoFormProps } from "./EditOutcomeTypes";
import { SSHConfig } from "../../../contexts/ContextTypes";
import { useGlobalContext } from "../../../contexts/ContextProvider";
import PKFileUploader from "./PKFileUploader";

type SShPredefineCommand = {
   label: string;
   command: string;
};

type SSHPredefineCommandListProps = {
   commands: SShPredefineCommand[] | undefined;
   selectedCommandIndex: number;
   setInputCmd: React.Dispatch<React.SetStateAction<SShPredefineCommand>>;
   setSelectedCommandIndex: React.Dispatch<React.SetStateAction<number>>;
   setSSHinfo: (value: React.SetStateAction<SSHConfig>) => void;
};

type SSHCommandFormProps = {
   selectedCommandIndex: number;
   inputCmd: SShPredefineCommand;
   onHide: (e: React.MouseEvent) => void;
   setSSHinfo: (value: React.SetStateAction<SSHConfig>) => void;
   setShowAddCmdForm: React.Dispatch<React.SetStateAction<boolean>>;
   setInputCmd: React.Dispatch<React.SetStateAction<SShPredefineCommand>>;
};

const SSHCommandForm = (props: SSHCommandFormProps) => {
   const handleAddOrUpdateCommand = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      e.preventDefault();
      props.setSSHinfo((prev) => {
         if (props.selectedCommandIndex >= 0) {
            // update command at selectedCommandIndex
            let newCommands = [...prev.commands!];
            newCommands[props.selectedCommandIndex] = props.inputCmd;
            return { ...prev, commands: newCommands };
         } else {
            if (prev.commands) {
               return { ...prev, commands: [...prev.commands, props.inputCmd] };
            } else {
               return { ...prev, commands: [props.inputCmd] };
            }
         }
      });
      props.setInputCmd({ label: "", command: "" });
      props.setShowAddCmdForm(false);
   };

   return (
      <>
         <div className="row mt-2">
            <div className="col-4">
               <input
                  className="form-control form-control-sm"
                  type="text"
                  name="label"
                  placeholder="Command name"
                  value={props.inputCmd.label}
                  onChange={(e) => props.setInputCmd((prev) => ({ ...prev, [e.target.name]: e.target.value }))}
               />
            </div>
            <div className="col-8">
               <textarea
                  className="form-control"
                  placeholder="Add your command here"
                  name="command"
                  value={props.inputCmd.command}
                  onChange={(e) => props.setInputCmd((prev) => ({ ...prev, [e.target.name]: e.target.value }))}
               ></textarea>
            </div>
         </div>
         {/* comfirm button */}
         <div className="row mt-2">
            <div className="col-12 d-flex justify-content-end">
               <button className="btn btn-sm me-2" onClick={props.onHide}>
                  Cancel
               </button>
               <button
                  className="btn btn-sm btn-primary"
                  disabled={!props.inputCmd.command || !props.inputCmd.label}
                  onClick={handleAddOrUpdateCommand}
               >
                  {props.selectedCommandIndex >= 0 ? "Update" : "Add"}
               </button>
            </div>
         </div>
      </>
   );
};

const SSHPredefineCommandList = (props: SSHPredefineCommandListProps) => {
   const handleDeleteCommand = (e: React.MouseEvent, index: number) => {
      e.stopPropagation();
      e.preventDefault();
      props.setSSHinfo((prev) => {
         if (prev.commands) {
            return { ...prev, commands: prev.commands.filter((_, i) => i !== index) };
         } else {
            return prev;
         }
      });
   };

   const handleSelectCommand = (cmd: SShPredefineCommand, index: number) => {
      props.setSelectedCommandIndex(index);
      props.setInputCmd(cmd);
   };

   const renderCommandList = () => {
      return props.commands!.map((cmd, index) => {
         return (
            <div
               key={index}
               className={`d-flex btn btn-sm btn${props.selectedCommandIndex === index ? "" : "-outline"}-info me-2 mt-2`}
               onClick={() => handleSelectCommand(cmd, index)}
            >
               <span className="me-2">{cmd.label}</span>
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

   if (!props.commands) return null;
   else return <div className="d-flex flex-wrap overflow-auto">{renderCommandList()}</div>;
};

const AddSSHInfoForm = (props: AddSSHInfoFormProps) => {
   const { context } = useGlobalContext();
   const [showAddCmdForm, setShowAddCmdForm] = useState(false);
   const [inputCmd, setInputCmd] = useState<SShPredefineCommand>({ label: "", command: "" });
   const [selectedCommandIndex, setSelectedCommandIndex] = useState(-1);

   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      props.setSSHinfo((prev) => ({ ...prev, [e.target.name]: e.target.value }));
   };

   const handleShowForm = (e: React.MouseEvent, isShow: boolean) => {
      e.stopPropagation();
      e.preventDefault();
      setShowAddCmdForm(isShow);
   };

   const renderSSHEndpoints = () => {
      if (!context.config.sshCliEndpoints) return null;
      return Object.keys(context.config.sshCliEndpoints).map((epName, i) => {
         return (
            <option key={i} value={epName}>
               {epName}
            </option>
         );
      });
   };

   useEffect(() => {
      if (!props.sshInfo.keyFilename) return;
      props.setSSHinfo((prev) => ({ ...prev, password: "" }));
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [props.sshInfo.keyFilename]);

   useEffect(() => {
      if (!props.sshInfo.inheritFrom) return;
      props.setSSHinfo((prev) => ({ ...prev, hostname: "", username: "", password: "", port: "", sshkey: "", keyFilename: "" }));
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [props.sshInfo.inheritFrom]);

   useEffect(() => {
      if (selectedCommandIndex >= 0) setShowAddCmdForm(true);
   }, [selectedCommandIndex]);

   useEffect(() => {
      if (!showAddCmdForm) {
         setSelectedCommandIndex(-1);
         setInputCmd({ label: "", command: "" });
      }
   }, [showAddCmdForm]);

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
                     <small>Inherit from SSH-Endpoint setting.</small>
                     <select
                        className="form-select form-select-sm"
                        name="inheritFrom"
                        value={props.sshInfo.inheritFrom}
                        onChange={handleInputChange}
                     >
                        <option value="">Manually fill host credential.</option>
                        {renderSSHEndpoints()}
                     </select>
                  </div>
               </div>
               <div className="row mt-2">
                  <div className="col-sm-12 col-md-4">
                     <small>Hostname</small>
                     <div className="row">
                        <div className="col-9">
                           <input
                              className="form-control form-control-sm"
                              type="text"
                              name="hostname"
                              value={props.sshInfo.hostname}
                              onChange={handleInputChange}
                              disabled={props.sshInfo.inheritFrom ? true : false}
                              required={props.sshInfo.inheritFrom ? false : true}
                           />
                        </div>
                        <div className="col-3 position-relative form-port-number">
                           <input
                              className="form-control form-control-sm"
                              type="number"
                              name="port"
                              value={props.sshInfo.port}
                              onChange={handleInputChange}
                              disabled={props.sshInfo.inheritFrom ? true : false}
                              required={props.sshInfo.inheritFrom ? false : true}
                           />
                        </div>
                     </div>
                  </div>

                  <div className="col-sm-12 col-md-4">
                     <small>Username</small>
                     <input
                        className="form-control form-control-sm"
                        type="text"
                        name="username"
                        value={props.sshInfo.username}
                        onChange={handleInputChange}
                        disabled={props.sshInfo.inheritFrom ? true : false}
                        required={props.sshInfo.inheritFrom ? false : true}
                     />
                  </div>
                  <div className="col-sm-12 col-md-4">
                     <small>Password</small>
                     <input
                        className="form-control form-control-sm"
                        type="text"
                        name="password"
                        value={props.sshInfo.password}
                        onChange={handleInputChange}
                        disabled={props.sshInfo.keyFilename || props.sshInfo.inheritFrom ? true : false}
                        required={props.sshInfo.keyFilename || props.sshInfo.inheritFrom ? false : true}
                     />
                  </div>
               </div>
               <div className="col-sm-12 col-md-4 mt-2 pe-3">
                  <PKFileUploader<SSHConfig>
                     disabled={props.sshInfo.inheritFrom ? true : false}
                     filename={props.sshInfo.keyFilename}
                     sshkey={props.sshInfo.sshkey}
                     setInfo={props.setSSHinfo}
                  />
               </div>
               <div className="mt-3 mb-2">
                  <span>Pre-defined SSH command</span>
                  <button
                     className="btn btn-xs btn-outline-secondary ms-4"
                     onClick={(e) => {
                        setSelectedCommandIndex(-1);
                        setInputCmd({ label: "", command: "" });
                        handleShowForm(e, true);
                     }}
                  >
                     Add <i className="fal fa-plus" />
                  </button>
                  <SSHPredefineCommandList
                     commands={props.sshInfo.commands}
                     selectedCommandIndex={selectedCommandIndex}
                     setInputCmd={setInputCmd}
                     setSelectedCommandIndex={setSelectedCommandIndex}
                     setSSHinfo={props.setSSHinfo}
                  />
                  {showAddCmdForm && (
                     <SSHCommandForm
                        selectedCommandIndex={selectedCommandIndex}
                        inputCmd={inputCmd}
                        onHide={(e: React.MouseEvent) => handleShowForm(e, false)}
                        setInputCmd={setInputCmd}
                        setSSHinfo={props.setSSHinfo}
                        setShowAddCmdForm={setShowAddCmdForm}
                     />
                  )}
               </div>
            </div>
         )}
      </div>
   );
};

export default AddSSHInfoForm;

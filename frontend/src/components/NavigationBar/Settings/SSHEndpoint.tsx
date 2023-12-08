import React, { useEffect, useState } from "react";
import { useGlobalContext } from "../../contexts/ContextProvider";
import { ContextState, SSHCliEndpointConfig } from "../../contexts/ContextTypes";
import _ from "lodash";

type EndpointViewerProps = {
   showEditor: boolean;
   showDeleteList: number[];
   setShowDeleteList: React.Dispatch<React.SetStateAction<number[]>>;
   onSelect: (sSHEndpoint: { name: string } & SSHCliEndpointConfig) => void;
};
type EndpointEditorProps = {
   initValue: ({ name: string } & SSHCliEndpointConfig) | null;
   onClose: () => void;
};

type sshCliEndpointstate = ({ name: string } & SSHCliEndpointConfig) | null;

type SSHEndpointEditorState = { name: string } & SSHCliEndpointConfig;

const DEFAULT_PROMPT_REGEX = {
   linux: ".*\\$",
   "cisco-ios": ".*#",
};

const DEFAULT_INPUT: SSHEndpointEditorState = {
   name: "",
   hostname: "",
   port: "22",
   username: "",
   password: "",
   deviceType: "linux",
   promptRegex: DEFAULT_PROMPT_REGEX.linux,
};

const EndpointEditor = (props: EndpointEditorProps) => {
   const [input, setInput] = useState<SSHEndpointEditorState>(DEFAULT_INPUT);
   const { context, dispatch } = useGlobalContext();
   const [errorOnForm, setErrorOnForm] = useState(false);
   const [oldName, setOldName] = useState<string | undefined>(undefined);
   const [enablePromptOveride, setEnablePromptOveride] = useState(false);

   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      if (e.target.name === "name") {
         if (props.initValue) {
            // updating the endpoint props.initValue.name
            if (e.target.value !== props.initValue.name && e.target.value in context.config.sshCliEndpoints) {
               setErrorOnForm(true);
            } else {
               setErrorOnForm(false);
            }
         } else {
            // adding a new endpoint
            if ("sshCliEndpoints" in context.config && e.target.value in context.config.sshCliEndpoints) {
               setErrorOnForm(true);
            } else {
               setErrorOnForm(false);
            }
         }
      }
      setInput((prev) => ({ ...prev, [e.target.name]: e.target.value }));
   };

   const handleSaveEndpoint = () => {
      dispatch({
         type: "addSSHEndpoint",
         payload: {
            name: input.name,
            hostname: input.hostname,
            port: input.port,
            username: input.username,
            password: input.password,
            deviceType: input.deviceType,
            promptRegex: input.promptRegex,
         },
      });

      props.onClose();
   };

   const handleUpdateEndpoint = () => {
      dispatch({
         type: "updateSSHEndpoint",
         payload: {
            oldName: oldName!,
            name: input.name,
            hostname: input.hostname,
            port: input.port,
            username: input.username,
            password: input.password,
            deviceType: input.deviceType,
            promptRegex: input.promptRegex,
         },
      });

      props.onClose();
   };

   useEffect(() => {
      setInput((prev) => ({ ...prev, promptRegex: DEFAULT_PROMPT_REGEX[input.deviceType] }));
   }, [input.deviceType]);

   useEffect(() => {
      if (!props.initValue) {
         setInput(DEFAULT_INPUT);
         return;
      }

      setInput({
         name: props.initValue.name,
         hostname: props.initValue.hostname,
         port: props.initValue.port,
         username: props.initValue.username,
         password: props.initValue.password,
         deviceType: props.initValue.deviceType,
         promptRegex: props.initValue.promptRegex,
      });
      setOldName(props.initValue.name);
   }, [props.initValue]);

   return (
      <div className="endpoint-form">
         <div className="d-flex align-items-center justify-content-between">
            <div className="row" style={{ width: "70%" }}>
               <div className="col-4">
                  <small>Device type</small>
                  <select
                     className="form-select form-select-sm"
                     name="deviceType"
                     value={input.deviceType}
                     onChange={handleInputChange}
                  >
                     <option value="linux">Linux</option>
                     <option value="cisco-ios">Cisco IOS</option>
                  </select>
               </div>
               <div className="col-4">
                  <small>Prompt RegEx.</small>
                  <input
                     className="form-control form-control-sm"
                     type="text"
                     name="promptRegex"
                     disabled={!enablePromptOveride}
                     value={input.promptRegex}
                     onChange={handleInputChange}
                  />
               </div>
               <div className="col-2 position-relative" style={{ top: 27 }}>
                  <div className="form-check">
                     <input
                        id="promptRegex-checkbox"
                        className="form-check-input"
                        type="checkbox"
                        name="promptRegex"
                        checked={enablePromptOveride}
                        onChange={() => setEnablePromptOveride(!enablePromptOveride)}
                     />
                     <label className="form-check-label font-sm" htmlFor="promptRegex-checkbox">
                        Override
                     </label>
                  </div>
               </div>
            </div>

            <div>
               <button
                  className="btn btn-xs btn-outline-info"
                  disabled={errorOnForm || !input.name || !input.hostname || !input.username || !input.password || !input.port}
                  onClick={oldName ? handleUpdateEndpoint : handleSaveEndpoint}
               >
                  {oldName ? "Update" : "Save"}
               </button>
               <button className="btn btn-xs btn-sm" onClick={props.onClose}>
                  Cancel
               </button>
            </div>
         </div>
         <div className="col-11">
            <div className="input-group my-3">
               <input
                  style={{ maxWidth: 200 }}
                  type="text"
                  className="form-control"
                  name="name"
                  placeholder="Endpoint Name"
                  required
                  value={input.name}
                  onChange={handleInputChange}
               />
               <input
                  type="text"
                  className="form-control"
                  name="hostname"
                  placeholder="IP address or Hostname"
                  required
                  value={input.hostname}
                  onChange={handleInputChange}
               />
               <input
                  type="text"
                  className="form-control"
                  name="port"
                  placeholder="TCP port"
                  value={input.port}
                  onChange={handleInputChange}
               />
            </div>
            <div className="input-group my-3">
               <input
                  type="text"
                  className="form-control"
                  name="username"
                  placeholder="Enter a username"
                  required
                  value={input.username}
                  onChange={handleInputChange}
               />
               <input
                  type="text"
                  className="form-control"
                  name="password"
                  placeholder="Enter a password"
                  required
                  value={input.password}
                  onChange={handleInputChange}
               />
            </div>
            {errorOnForm ? <div className="text-danger">Endpoint name already exists</div> : null}
         </div>
      </div>
   );
};

const EndpointViewer = ({ onSelect, setShowDeleteList, showDeleteList, showEditor }: EndpointViewerProps) => {
   const { context, dispatch } = useGlobalContext();

   const onSelectHandler = (name: string, endpoint: SSHCliEndpointConfig) => {
      onSelect({
         name: name,
         hostname: endpoint.hostname,
         port: endpoint.port,
         username: endpoint.username,
         password: endpoint.password,
         deviceType: endpoint.deviceType,
         promptRegex: endpoint.promptRegex,
      });
   };

   const usedEndpointHandler = (endpointName: string, context: ContextState) => {
      for (const phase in context.config.mainContent) {
         for (const action of context.config.mainContent[phase].actions) {
            if (action.type === "ssh-cli" && action.useEndpoint === endpointName) return true;
         }
      }
      return false;
   };

   const renderEndpoint = () => {
      if (!context.config.sshCliEndpoints || Object.keys(context.config.sshCliEndpoints).length === 0)
         return <small className="text-muted">No endpoints configured for commands</small>;

      return Object.keys(context.config.sshCliEndpoints).map((sSHEndpointName, index) => {
         return (
            <div key={index} className="row mb-2">
               <div className="col-10">
                  <div
                     className="input-group input-group-sm pointer"
                     onClick={() => onSelectHandler(sSHEndpointName, context.config.sshCliEndpoints[sSHEndpointName])}
                  >
                     <div className="form-control col-3">{sSHEndpointName}</div>
                     <div className="form-control col-9">{context.config.sshCliEndpoints[sSHEndpointName].hostname}</div>
                  </div>
               </div>

               <div className="col-2">
                  {showDeleteList.includes(index) ? (
                     <>
                        <span
                           className="pointer font-sm"
                           onClick={() => {
                              setShowDeleteList(showDeleteList.filter((el) => el !== index));
                           }}
                        >
                           Cancel
                        </span>
                        <span
                           className="pointer font-sm text-danger mx-2 text-hover-highlight"
                           onClick={() => {
                              dispatch({ type: "deleteSSHEndpoint", payload: { name: sSHEndpointName } });
                              setShowDeleteList(showDeleteList.filter((el) => el !== index));
                           }}
                        >
                           Delete
                        </span>
                     </>
                  ) : (
                     <button
                        className="btn btn-sm btn-text pointer"
                        disabled={showEditor || usedEndpointHandler(sSHEndpointName, context)}
                        onClick={() => {
                           setShowDeleteList([...showDeleteList, index]);
                        }}
                     >
                        <i className="fal fa-trash-alt"></i>
                     </button>
                  )}
               </div>
            </div>
         );
      });
   };

   return <div className="mb-3">{renderEndpoint()}</div>;
};

const SSHEndpoint = () => {
   const [selectedEndpoint, setSelectedEndpoint] = useState<sshCliEndpointstate>(null);
   const [showEditor, setShowEditor] = useState(false);
   const [showDeleteList, setShowDeleteList] = useState<number[]>([]);

   return (
      <div className="mb-3">
         SSH CLI Endpoints
         <button
            className="mx-3 btn btn-sm btn-text text-info text-hover-highlight"
            disabled={showEditor || showDeleteList.length > 0}
            onClick={() => {
               setSelectedEndpoint(null);
               setShowEditor(true);
            }}
         >
            Add
         </button>
         <EndpointViewer
            showEditor={showEditor}
            showDeleteList={showDeleteList}
            setShowDeleteList={setShowDeleteList}
            onSelect={(endpoint) => {
               if (!showEditor && showDeleteList.length === 0) {
                  setSelectedEndpoint(endpoint);
                  setShowEditor(true);
               }
            }}
         />
         {showEditor && <EndpointEditor initValue={selectedEndpoint} onClose={() => setShowEditor(false)} />}
      </div>
   );
};

export default SSHEndpoint;

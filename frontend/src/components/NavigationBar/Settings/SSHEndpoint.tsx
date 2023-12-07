import React, { useEffect, useState } from "react";
import { useGlobalContext } from "../../contexts/ContextProvider";
import { SSHCliEndpointConfig } from "../../contexts/ContextTypes";
import _ from "lodash";

type EndpointViewerProps = {
   onSelect: (sSHEndpoint: { name: string } & SSHCliEndpointConfig) => void;
};
type EndpointEditorProps = {
   initValue: ({ name: string } & SSHCliEndpointConfig) | null;
   onClose: () => void;
};

type sshCliEndpointstate = ({ name: string } & SSHCliEndpointConfig) | null;

type SSHEndpointEditorState = {
   input: { name: string; hostname: string; port: string; username: string; password: string };
};

const EndpointEditor = (props: EndpointEditorProps) => {
   const [state, setState] = useState<SSHEndpointEditorState>({
      input: { name: "", hostname: "", port: "22", username: "", password: "" },
   });
   const { context, dispatch } = useGlobalContext();
   const [errorOnForm, setErrorOnForm] = useState(false);

   const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            if (e.target.value in context.config.sshCliEndpoints) {
               setErrorOnForm(true);
            } else {
               setErrorOnForm(false);
            }
         }
      }
      setState((prev) => ({ ...prev, input: { ...prev.input, [e.target.name]: e.target.value } }));
   };

   const [oldName, setOldName] = useState<string | undefined>(undefined);

   const handleSaveEndpoint = () => {
      dispatch({
         type: "addSSHEndpoint",
         payload: {
            name: state.input.name,
            hostname: state.input.hostname,
            port: state.input.port,
            username: state.input.username,
            password: state.input.password,
         },
      });

      props.onClose();
   };

   const handleUpdateEndpoint = () => {
      dispatch({
         type: "updateSSHEndpoint",
         payload: {
            oldName: oldName!,
            name: state.input.name,
            hostname: state.input.hostname,
            port: state.input.port,
            username: state.input.username,
            password: state.input.password,
         },
      });

      props.onClose();
   };

   useEffect(() => {
      if (!props.initValue) {
         setState({ input: { name: "", hostname: "", port: "22", username: "", password: "" } });
         return;
      }

      setState({
         input: {
            name: props.initValue.name,
            hostname: props.initValue.hostname,
            port: props.initValue.port,
            username: props.initValue.username,
            password: props.initValue.password,
         },
      });
      setOldName(props.initValue.name);
   }, [props.initValue]);

   return (
      <div className="endpoint-form">
         <div className="d-flex align-items-center justify-content-between">
            <div>Command Endpoint</div>
            <div>
               <button
                  className="btn btn-xs btn-outline-info"
                  disabled={
                     errorOnForm ||
                     !state.input.name ||
                     !state.input.hostname ||
                     !state.input.username ||
                     !state.input.password ||
                     !state.input.port
                  }
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
                  value={state.input.name}
                  onChange={onChangeHandler}
               />
               <input
                  type="text"
                  className="form-control"
                  name="hostname"
                  placeholder="IP address or Hostname"
                  required
                  value={state.input.hostname}
                  onChange={onChangeHandler}
               />
               <input
                  type="text"
                  className="form-control"
                  name="port"
                  placeholder="TCP port"
                  value={state.input.port}
                  onChange={onChangeHandler}
               />
            </div>
            <div className="input-group my-3">
               <input
                  type="text"
                  className="form-control"
                  name="username"
                  placeholder="Enter a username"
                  required
                  value={state.input.username}
                  onChange={onChangeHandler}
               />
               <input
                  type="text"
                  className="form-control"
                  name="password"
                  placeholder="Enter a password"
                  required
                  value={state.input.password}
                  onChange={onChangeHandler}
               />
            </div>
            {errorOnForm ? <div className="text-danger">Endpoint name already exists</div> : null}
         </div>
      </div>
   );
};

const SSHEndpoint = () => {
   const [selectedEndpoint, setSelectedEndpoint] = useState<sshCliEndpointstate>(null);
   const [showEditor, setShowEditor] = useState(false);
   const [showDeleteList, setShowDeleteList] = useState<number[]>([]);

   const EndpointViewer = (props: EndpointViewerProps) => {
      const { context, dispatch } = useGlobalContext();

      const onSelectHandler = (name: string, endpoint: SSHCliEndpointConfig) => {
         props.onSelect({
            name: name,
            hostname: endpoint.hostname,
            port: endpoint.port,
            username: endpoint.username,
            password: endpoint.password,
         });
      };

      const renderEndpoint = () => {
         if (!context.config.sshCliEndpoints || Object.keys(context.config.sshCliEndpoints).length === 0)
            return <small className="text-muted">No endpoints configured for commands</small>;

         return Object.keys(context.config.sshCliEndpoints).map((sSHEndpointName, index) => {
            return (
               <div key={index} className="row">
                  <div className="mb-2 col-10">
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
                           className="btn btn-text pointer"
                           disabled={showEditor}
                           onClick={() => {
                              setShowDeleteList([...showDeleteList, index]);
                           }}
                        >
                           {"\u00D7"}
                        </button>
                     )}
                  </div>
               </div>
            );
         });
      };

      return <div className="mb-3">{renderEndpoint()}</div>;
   };

   return (
      <>
         <div className="mb-3">
            SSH CLI Endpoints
            <button
               className="mx-3 btn btn-text font-sm text-info pointer text-hover-highlight"
               disabled={showEditor || showDeleteList.length > 0}
               onClick={() => {
                  setSelectedEndpoint(null);
                  setShowEditor(true);
               }}
            >
               Add
            </button>
            <EndpointViewer
               onSelect={(endpoint) => {
                  if (!showEditor && showDeleteList.length === 0) {
                     setSelectedEndpoint(endpoint);
                     setShowEditor(true);
                  }
               }}
            />
            {showEditor && <EndpointEditor initValue={selectedEndpoint} onClose={() => setShowEditor(false)} />}
         </div>
      </>
   );
};

export default SSHEndpoint;

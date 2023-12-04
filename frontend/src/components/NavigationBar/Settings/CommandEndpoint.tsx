import React, { useEffect, useState } from "react";
import { useGlobalContext } from "../../contexts/ContextProvider";
import { CommandEndpointConfig } from "../../contexts/ContextTypes";
import _ from "lodash";

type EndpointViewerProps = {
   onSelect: (commandEndpoint: { name: string } & CommandEndpointConfig) => void;
};
type EndpointEditorProps = {
   initValue: ({ name: string } & CommandEndpointConfig) | null;
   onClose: () => void;
};

type CommandEndpointState = ({ name: string } & CommandEndpointConfig) | null;

type CommandEndpointEditorState = {
   input: { name: string; hostname: string; port: string; username: string; password: string };
};

const EndpointEditor = (props: EndpointEditorProps) => {
   const [state, setState] = useState<CommandEndpointEditorState>({
      input: { name: "", hostname: "", port: "22", username: "", password: "" },
   });
   const { dispatch } = useGlobalContext();

   const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
      setState((prev) => ({ ...prev, input: { ...prev.input, [e.target.name]: e.target.value } }));
   };

   const handleSaveEndpoint = () => {
      dispatch({
         type: "addCommandEndpoint",
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
   }, [props.initValue]);

   return (
      <div className="endpoint-form">
         <div className="d-flex align-items-center justify-content-between">
            <div>Command Endpoint</div>
            <div>
               <button
                  className="btn btn-xs btn-outline-info"
                  disabled={
                     !state.input.name ||
                     !state.input.hostname ||
                     !state.input.username ||
                     !state.input.password ||
                     !state.input.port
                  }
                  onClick={handleSaveEndpoint}
               >
                  Save
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
                  placeholder="Enter a username as a string"
                  required
                  value={state.input.username}
                  onChange={onChangeHandler}
               />
               <input
                  type="text"
                  className="form-control"
                  name="password"
                  placeholder="Enter a password as a string"
                  required
                  value={state.input.password}
                  onChange={onChangeHandler}
               />
            </div>
         </div>
      </div>
   );
};

const EndpointViewer = (props: EndpointViewerProps) => {
   const { context, dispatch } = useGlobalContext();
   const [showDeleteList, setShowDeleteList] = useState<number[]>([]);

   const onSelectHandler = (name: string, endpoint: CommandEndpointConfig) => {
      props.onSelect({
         name: name,
         hostname: endpoint.hostname,
         port: endpoint.port,
         username: endpoint.username,
         password: endpoint.password,
      });
   };

   const renderEndpoint = () => {
      if (!context.config.commandEndpoints || Object.keys(context.config.commandEndpoints).length === 0)
         return <small className="text-muted">No endpoints configured for commands</small>;

      return Object.keys(context.config.commandEndpoints).map((commandEndpointName, index) => {
         return (
            <div key={index} className="row">
               <div className="mb-2 col-10">
                  <div
                     className="input-group input-group-sm pointer"
                     onClick={() => onSelectHandler(commandEndpointName, context.config.commandEndpoints[commandEndpointName])}
                  >
                     <div className="form-control col-3">{commandEndpointName}</div>
                     <div className="form-control col-9">{context.config.commandEndpoints[commandEndpointName].hostname}</div>
                  </div>
               </div>

               <div className="col-2">
                  {showDeleteList.includes(index) ? (
                     <>
                        <span
                           className="pointer font-sm"
                           onClick={() => setShowDeleteList(showDeleteList.filter((el) => el !== index))}
                        >
                           Cancel
                        </span>
                        <span
                           className="pointer font-sm text-danger mx-2 text-hover-highlight"
                           onClick={() => dispatch({ type: "deleteCommandEndpoint", payload: { name: commandEndpointName } })}
                        >
                           Delete
                        </span>
                     </>
                  ) : (
                     <span className="pointer" onClick={() => setShowDeleteList([...showDeleteList, index])}>
                        {"\u00D7"}
                     </span>
                  )}
               </div>
            </div>
         );
      });
   };

   return <div className="mb-3">{renderEndpoint()}</div>;
};

const CommandEndpoint = () => {
   const [selectedEndpoint, setSelectedEndpoint] = useState<CommandEndpointState>(null);
   const [showEditor, setShowEditor] = useState(false);

   return (
      <>
         <div className="mb-3">
            Command Endpoints
            <span
               className="mx-3 font-sm text-info pointer text-hover-highlight"
               onClick={() => {
                  setSelectedEndpoint(null);
                  setShowEditor(true);
               }}
            >
               Add
            </span>
            <EndpointViewer
               onSelect={(endpoint) => {
                  setSelectedEndpoint(endpoint);
                  setShowEditor(true);
               }}
            />
            {showEditor && <EndpointEditor initValue={selectedEndpoint} onClose={() => setShowEditor(false)} />}
         </div>
      </>
   );
};

export default CommandEndpoint;

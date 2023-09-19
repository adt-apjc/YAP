import React, { useEffect, useState } from "react";
import { useGlobalContext } from "../../contexts/ContextProvider";
import { EndpointConfig } from "../../contexts/ContextTypes";

type EndpointViewerProps = {
   onSelect: (endpoint: { name: string } & EndpointConfig) => void;
};
type EndpointEditorProps = {
   initValue: ({ name: string } & EndpointConfig) | null;
   onClose: () => void;
};

type EndpointState = ({ name: string } & EndpointConfig) | null;

type EndpointEditorState = { input: { name: string; baseURL: string }; inputHeader: { key: any; value: any }[] };

const EndpointEditor = (props: EndpointEditorProps) => {
   const [state, setState] = useState<EndpointEditorState>({
      input: { name: "", baseURL: "" },
      inputHeader: [],
   });
   const { dispatch } = useGlobalContext();

   const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
      setState((prev) => ({ ...prev, input: { ...prev.input, [e.target.name]: e.target.value } }));
   };

   const onHeaderChangeHandler = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
      let currentHeader = state.inputHeader;
      currentHeader[index] = { ...currentHeader[index], [e.target.name]: e.target.value };
      setState((prev) => ({ ...prev, inputHeader: currentHeader }));
   };

   const onHeaderSaveHandler = () => {
      dispatch({
         type: "addEndpoint",
         payload: { name: state.input.name, baseURL: state.input.baseURL, headerList: state.inputHeader },
      });

      props.onClose();
   };

   const onHeaderDeleteHandler = (index: number) => {
      setState((prev) => ({ ...prev, inputHeader: prev.inputHeader.filter((_, i) => i !== index) }));
   };

   const onHeaderAddHandler = () => {
      setState((prev) => ({ ...prev, inputHeader: [...prev.inputHeader, { key: "", value: "" }] }));
   };

   const renderHeaderField = () => {
      return state.inputHeader.map((el, index) => {
         return (
            <React.Fragment key={index}>
               <div className="col-11">
                  <div className="input-group" style={{ marginTop: "-1px" }}>
                     <input
                        type="text"
                        className="form-control form-control-sm"
                        name="key"
                        placeholder="key"
                        required
                        value={el.key || ""}
                        onChange={(e) => onHeaderChangeHandler(e, index)}
                     />
                     <input
                        type="text"
                        className="form-control form-control-sm"
                        name="value"
                        placeholder="value"
                        required
                        value={el.value || ""}
                        onChange={(e) => onHeaderChangeHandler(e, index)}
                     />
                  </div>
               </div>
               <div className="col-1">
                  <span className="pointer" onClick={() => onHeaderDeleteHandler(index)}>
                     {"\u00D7"}
                  </span>
               </div>
            </React.Fragment>
         );
      });
   };

   useEffect(() => {
      if (!props.initValue) return;

      setState({
         input: { name: props.initValue.name, baseURL: props.initValue.baseURL },
         inputHeader:
            props.initValue && props.initValue.headers
               ? Object.keys(props.initValue.headers).map((key) => ({ key: key, value: props.initValue!.headers![key] }))
               : [],
      });
   }, [props.initValue]);

   return (
      <div className="endpoint-form">
         <div className="d-flex align-items-center justify-content-between">
            <div>Endpoint</div>
            <div className="d-flex">
               <div className="btn btn-sm text-info ms-auto" onClick={onHeaderSaveHandler}>
                  Save
               </div>
               <div className="btn btn-sm ms-auto" onClick={props.onClose}>
                  Cancel
               </div>
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
                  name="baseURL"
                  placeholder="Enter baseURL"
                  required
                  value={state.input.baseURL}
                  onChange={onChangeHandler}
               />
            </div>
         </div>
         <div className="mb-3">Header</div>
         <div className="row">{renderHeaderField()}</div>
         <div className="text-center text-info font-lg">
            <i className="fad fa-plus-circle icon-hover-highlight pointer" onClick={onHeaderAddHandler} />
         </div>
      </div>
   );
};

const EndpointViewer = (props: EndpointViewerProps) => {
   const { context, dispatch } = useGlobalContext();
   const [showDeleteList, setShowDeleteList] = useState<number[]>([]);

   const onSelectHandler = (name: string, endpoint: EndpointConfig) => {
      props.onSelect({ name: name, baseURL: endpoint.baseURL, headers: endpoint.headers });
   };

   const renderEndpoint = () => {
      if (!context.config.endpoints || Object.keys(context.config.endpoints).length === 0)
         return <small className="text-muted">No Endpoints</small>;

      return Object.keys(context.config.endpoints).map((endpointName, index) => {
         return (
            <div key={index} className="row">
               <div className="mb-2 col-10">
                  <div
                     className="input-group input-group-sm pointer"
                     onClick={() => onSelectHandler(endpointName, context.config.endpoints[endpointName])}
                  >
                     <div className="form-control col-3">{endpointName}</div>
                     <div className="form-control col-9">{context.config.endpoints[endpointName].baseURL}</div>
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
                           onClick={() => dispatch({ type: "deleteEndpoint", payload: { name: endpointName } })}
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

const Endpoint = () => {
   const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointState>(null);
   const [showEditor, setShowEditor] = useState(false);

   return (
      <>
         <div className="mb-3">
            Endpoints
            <span className="mx-3 font-sm text-info pointer text-hover-highlight" onClick={() => setShowEditor(true)}>
               Add
            </span>
         </div>
         <EndpointViewer
            onSelect={(endpoint) => {
               setSelectedEndpoint(endpoint);
               setShowEditor(true);
            }}
         />
         {showEditor && <EndpointEditor initValue={selectedEndpoint} onClose={() => setShowEditor(false)} />}
      </>
   );
};

export default Endpoint;

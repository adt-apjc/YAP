import React, { useEffect, useState } from "react";
import { useGlobalContext } from "../../contexts/ContextProvider";
import { EndpointConfig } from "../../contexts/ContextTypes";
import _ from "lodash";

type EndpointViewerProps = {
   showEditor: boolean;
   showDeleteList: number[];
   setShowDeleteList: React.Dispatch<React.SetStateAction<number[]>>;
   onSelect: (endpoint: { name: string } & EndpointConfig) => void;
};
type EndpointEditorProps = {
   initValue: ({ name: string } & EndpointConfig) | null;
   onClose: () => void;
};

type EndpointState = ({ name: string } & EndpointConfig) | null;

type EndpointEditorState = { input: { name: string; baseURL: string }; inputHeader: { key: string; value: string }[] };

type AuthHeaderGeneratorProps = {
   setEditorState: React.Dispatch<React.SetStateAction<EndpointEditorState>>;
};

const AuthHeaderGenerator = (props: AuthHeaderGeneratorProps) => {
   const [formType, setFormType] = useState("basic");
   const [showForm, setShowForm] = useState(false);
   const [basicFormInput, setBasicFormInput] = useState({ username: "", password: "" });
   const [bearerFormInput, setBearerFormInput] = useState("");

   const handleConfirm = () => {
      let authString: string;
      if (formType === "basic") authString = "Basic " + btoa(`${basicFormInput.username}:${basicFormInput.password}`);
      else authString = `Bearer ${bearerFormInput}`;

      props.setEditorState((prev) => {
         let cloned = _.cloneDeep(prev);
         let authIndex = cloned.inputHeader.findIndex((h) => h.key === "Authorization");
         console.log(authIndex);
         if (authIndex >= 0) cloned.inputHeader[authIndex].value = authString;
         else cloned.inputHeader.push({ key: "Authorization", value: authString });
         return cloned;
      });
   };

   const BasicForm = (
      <>
         <div className="font-sm">
            <label>Username</label>
            <input
               className="form-control form-control-sm"
               type="text"
               value={basicFormInput.username}
               onChange={(e) => setBasicFormInput((prev) => ({ ...prev, username: e.target.value }))}
            />
         </div>
         <div className="font-sm mt-2">
            <label>Password</label>
            <input
               className="form-control form-control-sm"
               type="text"
               value={basicFormInput.password}
               onChange={(e) => setBasicFormInput((prev) => ({ ...prev, password: e.target.value }))}
            />
         </div>
      </>
   );

   const BearerForm = (
      <div className="input-group input-group-sm">
         <span className="input-group-text">Bearer</span>
         <input
            type="text"
            className="form-control"
            placeholder="token"
            value={bearerFormInput}
            onChange={(e) => setBearerFormInput(e.target.value)}
         />
      </div>
   );

   return (
      <>
         <div className="form-check">
            <input
               className="form-check-input"
               type="checkbox"
               checked={showForm}
               id="showFormCheck"
               onChange={(e) => setShowForm(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="showFormCheck">
               Generate authorization header
            </label>
         </div>
         {showForm && (
            <div className="p-2 border rounded position-relative">
               <small className="fst-italic">
                  This helper is for creating the Authorization header, you're still able to edit the header in the section above.
               </small>
               <div className="row align-items-center mt-2">
                  <div className="col-3">Type</div>
                  <div className="col-6">
                     <select
                        className="form-select form-select-sm"
                        value={formType}
                        onChange={(e) => setFormType(e.target.value)}
                     >
                        <option value="basic">Basic</option>
                        <option value="bearer">Bearer Token</option>
                     </select>
                  </div>
               </div>
               <div className="row mt-3">
                  <div className="col-6 offset-3">
                     {formType === "basic" && BasicForm}
                     {formType === "bearer" && BearerForm}
                  </div>
                  <div className="col-3 d-flex align-items-end justify-content-end">
                     <button onClick={handleConfirm} className="btn btn-sm btn-primary">
                        Confirm
                     </button>
                  </div>
               </div>
            </div>
         )}
      </>
   );
};

const EndpointEditor = (props: EndpointEditorProps) => {
   const [state, setState] = useState<EndpointEditorState>({
      input: { name: "", baseURL: "" },
      inputHeader: [],
   });
   const { context, dispatch } = useGlobalContext();
   const [errorOnForm, setErrorOnForm] = useState(false);

   const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.name === "name") {
         if (props.initValue) {
            // updating the endpoint props.initValue.name
            if (e.target.value !== props.initValue.name && e.target.value in context.config.endpoints) {
               setErrorOnForm(true);
            } else {
               setErrorOnForm(false);
            }
         } else {
            // adding a new endpoint
            if ("endpoints" in context.config && e.target.value in context.config.endpoints) {
               setErrorOnForm(true);
            } else {
               setErrorOnForm(false);
            }
         }
      }
      setState((prev) => ({ ...prev, input: { ...prev.input, [e.target.name]: e.target.value } }));
   };

   const onHeaderChangeHandler = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
      let currentHeader = state.inputHeader;
      currentHeader[index] = { ...currentHeader[index], [e.target.name]: e.target.value };
      setState((prev) => ({ ...prev, inputHeader: currentHeader }));
   };

   const handleSaveEndpoint = () => {
      dispatch({
         type: "addEndpoint",
         payload: { name: state.input.name, baseURL: state.input.baseURL, headerList: state.inputHeader },
      });

      props.onClose();
   };

   const [oldName, setOldName] = useState<string | undefined>(undefined);

   const handleUpdateEndpoint = () => {
      dispatch({
         type: "updateEndpoint",
         payload: { oldName: oldName!, name: state.input.name, baseURL: state.input.baseURL, headerList: state.inputHeader },
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
      if (!props.initValue) {
         setState({ input: { name: "", baseURL: "" }, inputHeader: [] });
         return;
      }

      setState({
         input: { name: props.initValue.name, baseURL: props.initValue.baseURL },
         inputHeader:
            props.initValue && props.initValue.headers
               ? Object.keys(props.initValue.headers).map((key) => ({ key: key, value: props.initValue!.headers![key] }))
               : [],
      });

      setOldName(props.initValue.name);
   }, [props.initValue]);

   return (
      <div className="endpoint-form">
         <div className="d-flex align-items-center justify-content-between">
            <div>Endpoint</div>
            <div>
               <button
                  className="btn btn-xs btn-outline-info"
                  disabled={errorOnForm || !state.input.name || !state.input.baseURL}
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
                  name="baseURL"
                  placeholder="Enter baseURL"
                  required
                  value={state.input.baseURL}
                  onChange={onChangeHandler}
               />
            </div>
         </div>
         {errorOnForm ? <div className="text-danger">Endpoint name already exists</div> : null}

         <div className="mb-2">Header</div>
         <div className="row">{renderHeaderField()}</div>
         <div className="text-center text-info font-lg">
            <i className="fad fa-plus-circle icon-hover-highlight pointer" onClick={onHeaderAddHandler} />
         </div>
         <AuthHeaderGenerator setEditorState={setState} />
      </div>
   );
};

const EndpointViewer = ({ onSelect, setShowDeleteList, showDeleteList, showEditor }: EndpointViewerProps) => {
   const { context, dispatch } = useGlobalContext();

   const onSelectHandler = (name: string, endpoint: EndpointConfig) => {
      onSelect({ name: name, baseURL: endpoint.baseURL, headers: endpoint.headers });
   };

   const renderEndpoint = () => {
      if (!context.config.endpoints || Object.keys(context.config.endpoints).length === 0)
         return <small className="text-muted">No endpoints configured for APIs</small>;

      return Object.keys(context.config.endpoints).map((endpointName, index) => {
         return (
            <div key={index} className="row mb-2">
               <div className="col-10">
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
                           onClick={() => {
                              dispatch({ type: "deleteEndpoint", payload: { name: endpointName } });
                              setShowDeleteList(showDeleteList.filter((el) => el !== index));
                           }}
                        >
                           Delete
                        </span>
                     </>
                  ) : (
                     <button
                        className="btn btn-sm btn-text pointer"
                        disabled={showEditor}
                        onClick={() => setShowDeleteList([...showDeleteList, index])}
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

const Endpoint = () => {
   const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointState>(null);
   const [showEditor, setShowEditor] = useState(false);
   const [showDeleteList, setShowDeleteList] = useState<number[]>([]);

   return (
      <>
         <div className="mb-3">
            Endpoints
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
         </div>
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
      </>
   );
};

export default Endpoint;

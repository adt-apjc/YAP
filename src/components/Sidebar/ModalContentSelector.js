import React, { useContext, useEffect, useState } from "react";
import GlobalContext from "../contexts/ContextProvider";

const EndpointEditor = (props) => {
   const [state, setState] = useState({ input: { name: "", baseURL: "" }, inputHeader: [] });
   const context = useContext(GlobalContext);

   const onChangeHandler = (e) => {
      setState((prev) => ({ ...prev, input: { ...prev.input, [e.target.name]: e.target.value } }));
   };

   const onHeaderChangeHandler = (e, index) => {
      let currentHeader = state.inputHeader;
      currentHeader[index] = { ...currentHeader[index], [e.target.name]: e.target.value };
      setState((prev) => ({ ...prev, inputHeader: currentHeader }));
   };

   const onHeaderSaveHandler = () => {
      context.addEndpoint(state.input.name, state.input.baseURL, state.inputHeader);
      props.onClose();
   };

   const onHeaderDeleteHandler = (index) => {
      setState((prev) => ({ ...prev, inputHeader: prev.inputHeader.filter((el, i) => i !== index) }));
   };

   const onHeaderAddHandler = () => {
      setState((prev) => ({ ...prev, inputHeader: [...prev.inputHeader, {}] }));
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
         inputHeader: Object.keys(props.initValue.headers).map((key) => ({ key: key, value: props.initValue.headers[key] })),
      });
   }, [props.initValue]);

   return (
      <div className="endpoint-form">
         <div className="d-flex align-items-center">
            <div>New Endpoint</div>
            <div className="btn btn-sm btn-info ms-auto" onClick={onHeaderSaveHandler}>
               Save
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
            <i type="button" className="fad fa-plus-circle icon-hover-highlight" onClick={onHeaderAddHandler} />
         </div>
      </div>
   );
};

const EndpointViewer = (props) => {
   const context = useContext(GlobalContext);
   const [state, setState] = useState({ showDeleteEndpoint: [] });

   const onSelectHandler = (name, el) => {
      props.onSelect({ name: name, baseURL: el.baseURL, headers: el.headers });
   };

   const renderEndpoint = () => {
      return Object.keys(context.config.endpoints).map((endpointName, index) => {
         return (
            <div key={index} className="row">
               <div className="mb-2 col-10">
                  <div
                     className="input-group input-group-sm pointer"
                     onClick={() => onSelectHandler(endpointName, context.config.endpoints[endpointName])}
                  >
                     <div type="text" className="form-control col-3">
                        {endpointName}
                     </div>
                     <div type="text" className="form-control col-9">
                        {context.config.endpoints[endpointName].baseURL}
                     </div>
                  </div>
               </div>

               <div className="col-2">
                  {state.showDeleteEndpoint.includes(index) ? (
                     <>
                        <span
                           className="pointer font-sm"
                           onClick={() => setState({ showDeleteEndpoint: state.showDeleteEndpoint.filter((el) => el !== index) })}
                        >
                           Cancel
                        </span>
                        <span
                           className="pointer font-sm text-danger mx-2 text-hover-highlight"
                           onClick={() => context.deleteEndpoint(endpointName)}
                        >
                           Delete
                        </span>
                     </>
                  ) : (
                     <span
                        className="pointer"
                        onClick={() => setState({ showDeleteEndpoint: [...state.showDeleteEndpoint, index] })}
                     >
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

const Settings = (props) => {
   const [state, setState] = useState({ selectedEndpoint: null, showEndpointEditor: false });

   return (
      <>
         <div className="modal-header">
            <span className="modal-title">Settings</span>
            <button type="button" className="btn-close" onClick={props.onHide}></button>
         </div>
         <div className="modal-body">
            <div className="mb-3">
               Endpoint
               <span
                  className="mx-3 font-sm text-info pointer text-hover-highlight"
                  onClick={() => setState({ showEndpointEditor: true })}
               >
                  Add
               </span>
            </div>
            <EndpointViewer onSelect={(el) => setState({ selectedEndpoint: el, showEndpointEditor: true })} />
            {state.showEndpointEditor && (
               <EndpointEditor
                  initValue={state.selectedEndpoint}
                  onClose={() => setState({ showEndpointEditor: false, selectedEndpoint: null })}
               />
            )}
         </div>
         <div className="modal-footer">
            <button type="button" className="btn btn-sm btn-danger" onClick={props.onHide}>
               Close
            </button>
         </div>
      </>
   );
};

const ModalContentSelector = (props) => {
   let { contentType } = props;
   if (contentType === "settings") {
      return <Settings {...props} />;
   } else {
      return null;
   }
};

export default ModalContentSelector;

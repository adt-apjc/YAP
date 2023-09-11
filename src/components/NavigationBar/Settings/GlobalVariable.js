import React, { useState } from "react";
import { useGlobalContext } from "../../contexts/ContextProvider";

const GlobalVarEditor = (props) => {
   const [state, setState] = useState({ name: "", val: "" });
   const { dispatch } = useGlobalContext();

   const onChangeHandler = (e) => {
      setState({ ...state, [e.target.name]: e.target.value });
   };

   const onHeaderSaveHandler = () => {
      dispatch({
         type: "addGlobalVar",
         payload: { name: state.name, val: state.val },
      });

      props.onClose();
   };

   return (
      <div className="endpoint-form">
         <div className="d-flex align-items-center justify-content-between">
            <div>New Variable</div>
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
                  placeholder="Key"
                  required
                  value={state.name}
                  onChange={onChangeHandler}
               />
               <input
                  type="text"
                  className="form-control"
                  name="val"
                  placeholder="Value"
                  required
                  value={state.val}
                  onChange={onChangeHandler}
               />
            </div>
         </div>
      </div>
   );
};

const GlobalVarViewer = (props) => {
   const { context, dispatch } = useGlobalContext();
   const [state, setState] = useState({ showDeleteGlobalVar: [] });

   const renderGlobalVar = () => {
      if (!context.config.globalVariables || Object.keys(context.config.globalVariables).length === 0)
         return <small className="text-muted">No Global Variables</small>;

      return Object.keys(context.config.globalVariables).map((varName, index) => {
         return (
            <div key={index} className="row">
               <div className="mb-2 col-10">
                  <div className="input-group input-group-sm pointer">
                     <div type="text" className="form-control col-3">
                        {varName}
                     </div>
                     <div type="text" className="form-control col-9">
                        {context.config.globalVariables[varName]}
                     </div>
                  </div>
               </div>
               <div className="col-2">
                  {state.showDeleteGlobalVar.includes(index) ? (
                     <>
                        <span
                           className="pointer font-sm"
                           onClick={() =>
                              setState({ showDeleteGlobalVar: state.showDeleteGlobalVar.filter((el) => el !== index) })
                           }
                        >
                           Cancel
                        </span>
                        <span
                           className="pointer font-sm text-danger mx-2 text-hover-highlight"
                           onClick={() => dispatch({ type: "deleteGlobalVar", payload: { name: varName } })}
                        >
                           Delete
                        </span>
                     </>
                  ) : (
                     <span
                        className="pointer"
                        onClick={() => setState({ showDeleteGlobalVar: [...state.showDeleteGlobalVar, index] })}
                     >
                        {"\u00D7"}
                     </span>
                  )}
               </div>
            </div>
         );
      });
   };

   return <div className="mb-3">{renderGlobalVar()}</div>;
};

const GlobalVariable = () => {
   const [showGlobalVarEditor, setShowGlobalVarEditor] = useState(false);

   return (
      <>
         <div className="mt-4 mb-2">
            Global Variables
            <span className="mx-3 font-sm text-info pointer text-hover-highlight" onClick={() => setShowGlobalVarEditor(true)}>
               Add
            </span>
         </div>
         <GlobalVarViewer />
         {showGlobalVarEditor && <GlobalVarEditor onClose={() => setShowGlobalVarEditor(false)} />}
      </>
   );
};

export default GlobalVariable;

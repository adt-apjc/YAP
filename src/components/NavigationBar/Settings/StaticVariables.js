import React, { useEffect, useState } from "react";
import { useGlobalContext } from "../../contexts/ContextProvider";

const StaticVarEditor = (props) => {
   const [state, setState] = useState({ name: "", val: "" });
   const { dispatch } = useGlobalContext();

   const onChangeHandler = (e) => {
      setState({ ...state, [e.target.name]: e.target.value });
   };

   const onHeaderSaveHandler = () => {
      dispatch({
         type: "addStaticVar",
         payload: { name: state.name, val: state.val },
      });

      props.onClose();
   };

   useEffect(() => {
      if (!props.initValue) return;

      setState({ name: props.initValue.name, val: props.initValue.val });
   }, [props.initValue]);

   return (
      <div className="endpoint-form">
         <div className="d-flex align-items-center justify-content-between">
            <div>Static Variable</div>
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

const StaticVarViewer = (props) => {
   const { context, dispatch } = useGlobalContext();
   const [state, setState] = useState({ showDeleteStaticVar: [] });

   const onSelectHandler = (varName, val) => {
      props.onSelect({ name: varName, val });
   };

   const renderStaticVar = () => {
      if (!context.config.staticVariables || Object.keys(context.config.staticVariables).length === 0)
         return <small className="text-muted">No Static Variables</small>;

      return Object.keys(context.config.staticVariables).map((varName, index) => {
         return (
            <div key={index} className="row">
               <div className="mb-2 col-10">
                  <div
                     className="input-group input-group-sm pointer"
                     onClick={() => onSelectHandler(varName, context.config.staticVariables[varName])}
                  >
                     <div type="text" className="form-control col-3">
                        {varName}
                     </div>
                     <div type="text" className="form-control col-9">
                        {context.config.staticVariables[varName]}
                     </div>
                  </div>
               </div>
               <div className="col-2">
                  {state.showDeleteStaticVar.includes(index) ? (
                     <>
                        <span
                           className="pointer font-sm"
                           onClick={() =>
                              setState({ showDeleteStaticVar: state.showDeleteStaticVar.filter((el) => el !== index) })
                           }
                        >
                           Cancel
                        </span>
                        <span
                           className="pointer font-sm text-danger mx-2 text-hover-highlight"
                           onClick={() => dispatch({ type: "deleteStaticVar", payload: { name: varName } })}
                        >
                           Delete
                        </span>
                     </>
                  ) : (
                     <span
                        className="pointer"
                        onClick={() => setState({ showDeleteStaticVar: [...state.showDeleteStaticVar, index] })}
                     >
                        {"\u00D7"}
                     </span>
                  )}
               </div>
            </div>
         );
      });
   };

   return <div className="mb-3">{renderStaticVar()}</div>;
};

const StaticVariables = () => {
   const [state, setState] = useState({ selectedVar: null, showStaticVarEditor: false });

   return (
      <>
         <div className="mt-4 mb-2">
            Static Variables
            <span
               className="mx-3 font-sm text-info pointer text-hover-highlight"
               onClick={() => setState({ showStaticVarEditor: true })}
            >
               Add
            </span>
         </div>
         <StaticVarViewer onSelect={(el) => setState({ selectedVar: el, showStaticVarEditor: true })} />
         {state.showStaticVarEditor && (
            <StaticVarEditor
               initValue={state.selectedVar}
               onClose={() => setState({ showStaticVarEditor: false, selectedVar: null })}
            />
         )}
      </>
   );
};

export default StaticVariables;

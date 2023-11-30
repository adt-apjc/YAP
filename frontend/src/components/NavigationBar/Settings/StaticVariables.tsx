import { useEffect, useState } from "react";
import { useGlobalContext } from "../../contexts/ContextProvider";

type StaticVarEditorProps = {
   initValue: { name: string; val: any } | null;
   onClose: () => void;
};

type StaticVarViewerProps = {
   onSelect: (v: { name: string; val: any }) => void;
};

const StaticVarEditor = (props: StaticVarEditorProps) => {
   const [state, setState] = useState({ name: "", val: "" });
   const { dispatch } = useGlobalContext();

   const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      if (!props.initValue) {
         setState({ name: "", val: "" });
         return;
      }

      setState({ name: props.initValue.name, val: props.initValue.val });
   }, [props.initValue]);

   return (
      <div className="endpoint-form">
         <div className="d-flex align-items-center justify-content-between">
            <div>Static Variable</div>
            <div className="d-flex">
               <button className="btn btn-xs btn-outline-info" disabled={!state.name || !state.val} onClick={onHeaderSaveHandler}>
                  Save
               </button>
               <button className="btn btn-xs" onClick={props.onClose}>
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

const StaticVarViewer = (props: StaticVarViewerProps) => {
   const { context, dispatch } = useGlobalContext();
   const [showDeleteList, setShowDeleteList] = useState<number[]>([]);

   const onSelectHandler = (varName: string, val: any) => {
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
                     onClick={() => onSelectHandler(varName, context.config.staticVariables![varName])}
                  >
                     <div className="form-control col-3">{varName}</div>
                     <div className="form-control col-9">{context.config.staticVariables![varName]}</div>
                  </div>
               </div>
               <div className="col-2">
                  {showDeleteList.includes(index) ? (
                     <>
                        <span
                           className="pointer font-sm"
                           onClick={() => setShowDeleteList((prev) => prev.filter((el) => el !== index))}
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
                     <span className="pointer" onClick={() => setShowDeleteList([...showDeleteList, index])}>
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

type StaticVariablesState = { selectedVar: { name: string; val: any } | null; showStaticVarEditor: boolean };

const StaticVariables = () => {
   const [state, setState] = useState<StaticVariablesState>({
      selectedVar: null,
      showStaticVarEditor: false,
   });

   return (
      <>
         <div className="mt-4 mb-2">
            Static Variables
            <span
               className="mx-3 font-sm text-info pointer text-hover-highlight"
               onClick={() => setState({ selectedVar: null, showStaticVarEditor: true })}
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

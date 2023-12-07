import { useEffect, useState } from "react";
import { useGlobalContext } from "../../contexts/ContextProvider";

type StaticVarEditorProps = {
   initValue: { name: string; val: any } | null;
   onClose: () => void;
};

type StaticVarViewerProps = {
   showStaticVarEditor: boolean;
   showDeleteList: number[];
   setShowDeleteList: React.Dispatch<React.SetStateAction<number[]>>;
   onSelect: (v: { name: string; val: any }) => void;
};

type StaticVariablesState = { selectedVar: { name: string; val: any } | null; showStaticVarEditor: boolean };

const StaticVarEditor = (props: StaticVarEditorProps) => {
   const [state, setState] = useState({ name: "", val: "" });
   const { context, dispatch } = useGlobalContext();
   const [errorOnForm, setErrorOnForm] = useState(false);

   const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
      if ("staticVariables" in context.config && e.target.name === "name") {
         if (props.initValue) {
            console.log(context.config.staticVariables);
            // updating the endpoint props.initValue.name
            if (e.target.value !== props.initValue.name && e.target.value in context.config.staticVariables!) {
               setErrorOnForm(true);
            } else {
               setErrorOnForm(false);
            }
         } else {
            // adding a new endpoint
            if (e.target.value in context.config.staticVariables!) {
               setErrorOnForm(true);
            } else {
               setErrorOnForm(false);
            }
         }
      }
      setState({ ...state, [e.target.name]: e.target.value });
   };

   const [oldName, setOldName] = useState<string | undefined>(undefined);

   const onHeaderSaveHandler = () => {
      dispatch({
         type: "addStaticVar",
         payload: { name: state.name, val: state.val },
      });

      props.onClose();
   };

   const onHeaderUpdateHandler = () => {
      dispatch({
         type: "updateStaticVar",
         payload: { oldName: oldName!, name: state.name, val: state.val },
      });

      props.onClose();
   };

   useEffect(() => {
      if (!props.initValue) {
         setState({ name: "", val: "" });
         return;
      }

      setState({ name: props.initValue.name, val: props.initValue.val });
      setOldName(props.initValue.name);
   }, [props.initValue]);

   return (
      <div className="endpoint-form">
         <div className="d-flex align-items-center justify-content-between">
            <div>Static Variable</div>
            <div className="d-flex">
               <button
                  className="btn btn-xs btn-outline-info"
                  disabled={errorOnForm || !state.name || !state.val}
                  onClick={oldName ? onHeaderUpdateHandler : onHeaderSaveHandler}
               >
                  {oldName ? "Update" : "Save"}
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
            {errorOnForm ? <div className="text-danger">Variable name already exists</div> : null}
         </div>
      </div>
   );
};

const StaticVarViewer = ({ onSelect, setShowDeleteList, showDeleteList, showStaticVarEditor }: StaticVarViewerProps) => {
   const { context, dispatch } = useGlobalContext();

   const onSelectHandler = (varName: string, val: any) => {
      onSelect({ name: varName, val });
   };

   const renderStaticVar = () => {
      if (!context.config.staticVariables || Object.keys(context.config.staticVariables).length === 0)
         return <small className="text-muted">No Static Variables</small>;

      return Object.keys(context.config.staticVariables).map((varName, index) => {
         return (
            <div key={index} className="row mb-2">
               <div className="col-10">
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
                           onClick={() => {
                              dispatch({ type: "deleteStaticVar", payload: { name: varName } });
                              setShowDeleteList((prev) => prev.filter((el) => el !== index));
                           }}
                        >
                           Delete
                        </span>
                     </>
                  ) : (
                     <button
                        className="btn btn-sm btn-text pointer"
                        disabled={showStaticVarEditor}
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

   return <div className="mb-3">{renderStaticVar()}</div>;
};

const StaticVariables = () => {
   const [state, setState] = useState<StaticVariablesState>({
      selectedVar: null,
      showStaticVarEditor: false,
   });
   const [showDeleteList, setShowDeleteList] = useState<number[]>([]);

   return (
      <>
         <div className="mt-4 mb-2">
            Static Variables
            <button
               className="mx-3 btn btn-sm btn-text text-info text-hover-highlight"
               disabled={state.showStaticVarEditor || showDeleteList.length > 0}
               onClick={() => setState({ selectedVar: null, showStaticVarEditor: true })}
            >
               Add
            </button>
         </div>
         <StaticVarViewer
            showStaticVarEditor={state.showStaticVarEditor}
            showDeleteList={showDeleteList}
            setShowDeleteList={setShowDeleteList}
            onSelect={(el) => {
               if (!state.showStaticVarEditor && showDeleteList.length === 0) {
                  setState({ selectedVar: el, showStaticVarEditor: true });
               }
            }}
         />
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

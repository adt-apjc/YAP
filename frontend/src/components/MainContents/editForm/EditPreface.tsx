import { useState } from "react";
import { useGlobalContext } from "../../contexts/ContextProvider";

import AceEditor from "react-ace";
import "ace-builds/webpack-resolver";
import "ace-builds/src-noconflict/mode-markdown";
import "ace-builds/src-noconflict/theme-github";

import { cloneDeep } from "lodash";
import { PrefaceConfig } from "../../contexts/ContextTypes";

type EditPrefaceProps = {
   onHide: () => void;
   initValue: { index: number; config: PrefaceConfig };
};

const EditPreface = (props: EditPrefaceProps) => {
   const { context, dispatch } = useGlobalContext();
   const [state, setState] = useState({
      bodyMarkdown: props.initValue ? props.initValue.config.bodyMarkdown : "",
      stepDesc: props.initValue ? props.initValue.config.stepDesc : "",
   });

   const onEditHandler = () => {
      let currentConfig = cloneDeep(context.config);
      if (props.initValue) {
         // Edit mode
         currentConfig.preface[props.initValue.index].bodyMarkdown = state.bodyMarkdown.trim();
         currentConfig.preface[props.initValue.index].stepDesc = state.stepDesc;
      } else {
         // create new one
         currentConfig.preface.push({
            bodyMarkdown: state.bodyMarkdown.trim(),
            stepDesc: state.stepDesc,
         });
      }
      dispatch({ type: "replaceConfig", payload: currentConfig });
      props.onHide();
   };

   return (
      <>
         <div className="modal-header">
            <span className="modal-title">Preface Editor</span>
            <button type="button" className="btn-close" onClick={props.onHide}></button>
         </div>
         <div className="modal-body">
            <div className="input-group">
               <input
                  className="form-control form-control-sm mb-2 col-6"
                  placeholder="Step title"
                  value={state.stepDesc}
                  onChange={(e) => setState({ ...state, stepDesc: e.target.value })}
               ></input>
            </div>
            <AceEditor
               mode="markdown"
               theme="github"
               height="500px"
               width="100%"
               value={state.bodyMarkdown}
               onChange={(value) => setState({ ...state, bodyMarkdown: value })}
               placeholder="Markdown and html content"
               name="data"
               className="rounded border"
               editorProps={{ $blockScrolling: true }}
               showPrintMargin={false}
            />
         </div>
         <div className="modal-footer p-1">
            <button type="button" className="btn btn-sm" onClick={props.onHide}>
               Close
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={onEditHandler}>
               {props.initValue ? "Edit" : "Create"}
            </button>
         </div>
      </>
   );
};

export default EditPreface;

import React, { useState } from "react";
import { useGlobalContext } from "../../contexts/ContextProvider";

import AceEditor from "react-ace";
import "ace-builds/webpack-resolver";
import "ace-builds/src-noconflict/mode-html";
import "ace-builds/src-noconflict/theme-github";

import { cloneDeep } from "lodash";

const EditStepDescription = (props) => {
   const { context, dispatch } = useGlobalContext();
   const [state, setState] = useState({
      descriptionInput: props.initValue && props.initValue.description ? props.initValue.description : "",
      titleInput: props.initValue ? props.initValue.title : "",
   });

   const findCurrentStepIndex = () => {
      let currentStepName = context.currentStep.name;
      for (let i in context.config.sidebar) {
         if (context.config.sidebar[i].name === currentStepName) return i;
      }
   };

   const onEditHandler = () => {
      let currentConfig = cloneDeep(context.config);
      currentConfig.mainContent[context.currentStep.name].description = state.descriptionInput;
      currentConfig.sidebar[findCurrentStepIndex()].label = state.titleInput;
      dispatch({ type: "replaceConfig", payload: currentConfig });
      dispatch({ type: "setCurrentStep", payload: { ...context.currentStep, label: state.titleInput } });
      props.onHide();
   };

   return (
      <>
         <div className="modal-header">
            <span className="modal-title">Edit Title/Description</span>
            <button type="button" className="btn-close" onClick={props.onHide}></button>
         </div>
         <div className="modal-body">
            <input
               className="form-control form-control-sm mb-2"
               placeholder="title"
               value={state.titleInput}
               onChange={(e) => setState({ ...state, titleInput: e.target.value })}
            ></input>
            <AceEditor
               mode="html"
               theme="github"
               height="500px"
               width="100%"
               defaultValue={state.descriptionInput}
               onChange={(value) => setState({ ...state, descriptionInput: value })}
               placeholder="description"
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
               Edit
            </button>
         </div>
      </>
   );
};

export default EditStepDescription;

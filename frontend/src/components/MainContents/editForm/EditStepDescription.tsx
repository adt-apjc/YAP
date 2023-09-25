import React, { useState } from "react";
import { useGlobalContext } from "../../contexts/ContextProvider";

import AceEditor from "react-ace";
import "ace-builds/webpack-resolver";
import "ace-builds/src-noconflict/mode-markdown";
import "ace-builds/src-noconflict/theme-github";

import { cloneDeep } from "lodash";

type EditStepDescriptionProps = {
   onHide: () => void;
   initValue: {
      title: string;
      description: string | null;
   };
};

const EditStepDescription = (props: EditStepDescriptionProps) => {
   const { context, dispatch } = useGlobalContext();
   const [state, setState] = useState({
      descriptionInput: props.initValue && props.initValue.description ? props.initValue.description : "",
      titleInput: props.initValue ? props.initValue.title : "",
      prefaceRef: context.config.mainContent[context.currentStep.name!].prefaceRef || 0,
   });
   const hidePrefaceRefNameList = ["stage", "cleanup", "unstage"];

   const findCurrentStepIndex = () => {
      let currentStepName = context.currentStep.name;
      for (let i in context.config.sidebar) {
         if (context.config.sidebar[i].name === currentStepName) return parseInt(i);
      }
      return -1;
   };

   const onEditHandler = () => {
      let currentConfig = cloneDeep(context.config);
      currentConfig.mainContent[context.currentStep.name!].description = state.descriptionInput;
      currentConfig.mainContent[context.currentStep.name!].prefaceRef = state.prefaceRef;
      if (!["cleanup", "unstage", "stage"].includes(context.currentStep.name!)) {
         let sidebarIndex = findCurrentStepIndex();
         if (sidebarIndex < 0) {
            props.onHide();
            return;
         }
         currentConfig.sidebar[sidebarIndex].label = state.titleInput;
      }
      dispatch({ type: "replaceConfig", payload: currentConfig });
      dispatch({ type: "setCurrentStep", payload: { ...context.currentStep, label: state.titleInput } });
      props.onHide();
   };

   const generatePrefaceRefOptions = () => {
      return (
         <>
            {context.config.preface.map((el, i) => {
               return (
                  <option key={i} value={i}>
                     {el.stepDesc}
                  </option>
               );
            })}
         </>
      );
   };

   return (
      <>
         <div className="modal-header">
            <span className="modal-title">Edit Title/Description</span>
            <button type="button" className="btn-close" onClick={props.onHide}></button>
         </div>
         <div className="modal-body">
            <div className="d-flex justify-content-between">
               <div className="d-flex flex-column flex-grow-1 me-3 mb-2">
                  <small>Title</small>
                  <input
                     className="form-control form-control-sm"
                     placeholder="title"
                     value={state.titleInput}
                     onChange={(e) => setState({ ...state, titleInput: e.target.value })}
                  ></input>
               </div>
               {!hidePrefaceRefNameList.includes(context.currentStep.name ? context.currentStep.name : "") && (
                  <div className="d-flex flex-column flex-grow-1">
                     <small className="text-nowrap">Preface Reference </small>
                     <select
                        className="form-select form-select-sm"
                        name="type"
                        value={state.prefaceRef}
                        onChange={(e) => setState({ ...state, prefaceRef: parseInt(e.target.value) })}
                     >
                        {generatePrefaceRefOptions()}
                     </select>
                  </div>
               )}
            </div>
            <small>Description</small>
            <AceEditor
               mode="markdown"
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

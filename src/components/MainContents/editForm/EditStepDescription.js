import React from "react";
import GlobalContext from "../../contexts/ContextProvider";

import AceEditor from "react-ace";
import "ace-builds/webpack-resolver";
import "ace-builds/src-noconflict/mode-html";
import "ace-builds/src-noconflict/theme-github";

import { cloneDeep } from "lodash";
class EditStepDescription extends React.Component {
   state = {
      descriptionInput:
         this.props.initValue && this.props.initValue.description ? this.props.initValue.description.join("\n") : "",
      titleInput: this.props.initValue ? this.props.initValue.title : "",
   };

   _findCurrentStepIndex = () => {
      let Context = this.context;
      let currentStepName = Context.currentStep.name;
      for (let i in Context.config.sidebar) {
         if (Context.config.sidebar[i].name === currentStepName) return i;
      }
   };

   onEditHandler = () => {
      let Context = this.context;
      let currentConfig = cloneDeep(Context.config);
      currentConfig.mainContent[Context.currentStep.name].description = this.state.descriptionInput.trim().split("\n");
      currentConfig.sidebar[this._findCurrentStepIndex()].label = this.state.titleInput;
      Context.updateConfig(currentConfig);
      this.props.onHide();
   };

   render() {
      return (
         <>
            <div className="modal-header">
               <span className="modal-title">Edit Title/Description</span>
               <button type="button" className="btn-close" onClick={this.props.onHide}></button>
            </div>
            <div className="modal-body">
               <input
                  className="form-control form-control-sm mb-2"
                  placeholder="title"
                  value={this.state.titleInput}
                  onChange={(e) => this.setState({ titleInput: e.target.value })}
               ></input>
               <AceEditor
                  mode="html"
                  theme="github"
                  height="500px"
                  width="100%"
                  defaultValue={this.state.descriptionInput}
                  onChange={(value) => this.setState({ descriptionInput: value })}
                  placeholder="description"
                  name="data"
                  className="rounded border"
                  editorProps={{ $blockScrolling: true }}
                  showPrintMargin={false}
               />
            </div>
            <div className="modal-footer p-1">
               <button type="button" className="btn btn-sm" onClick={this.props.onHide}>
                  Close
               </button>
               <button type="button" className="btn btn-primary btn-sm" onClick={this.onEditHandler}>
                  Edit
               </button>
            </div>
         </>
      );
   }
}
EditStepDescription.contextType = GlobalContext;

export default EditStepDescription;

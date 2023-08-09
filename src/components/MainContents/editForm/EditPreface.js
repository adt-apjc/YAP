import React from "react";
import GlobalContext from "../../contexts/ContextProvider";

import AceEditor from "react-ace";
import "ace-builds/webpack-resolver";
import "ace-builds/src-noconflict/mode-html";
import "ace-builds/src-noconflict/theme-github";

import { cloneDeep } from "lodash";

class EditPreface extends React.Component {
   state = {
      bodyArr: this.props.initValue ? this.props.initValue.config.bodyArr.join("\n") : "",
      title: this.props.initValue ? this.props.initValue.config.title : "",
      stepDesc: this.props.initValue ? this.props.initValue.config.stepDesc : "",
   };

   onEditHandler = () => {
      let Context = this.context;
      let currentConfig = cloneDeep(Context.config);
      if (this.props.initValue) {
         // Edit mode
         currentConfig.preface[this.props.initValue.index].bodyArr = this.state.bodyArr.trim().split("\n");
         currentConfig.preface[this.props.initValue.index].title = this.state.title;
         currentConfig.preface[this.props.initValue.index].stepDesc = this.state.stepDesc;
      } else {
         // create new one
         currentConfig.preface.push({
            bodyArr: this.state.bodyArr.trim().split("\n"),
            title: this.state.title,
            stepDesc: this.state.stepDesc,
         });
      }
      Context.updateConfig(currentConfig);
      this.props.onHide();
   };

   render() {
      return (
         <>
            <div className="modal-header">
               <span className="modal-title">Preface Editor</span>
               <button type="button" className="btn-close" onClick={this.props.onHide}></button>
            </div>
            <div className="modal-body">
               <div className="input-group">
                  <input
                     className="form-control form-control-sm mb-2 col-6"
                     placeholder="title"
                     value={this.state.title}
                     onChange={(e) => this.setState({ title: e.target.value })}
                  ></input>
                  <input
                     className="form-control form-control-sm mb-2 col-6"
                     placeholder="Step title"
                     value={this.state.stepDesc}
                     onChange={(e) => this.setState({ stepDesc: e.target.value })}
                  ></input>
               </div>
               <AceEditor
                  mode="html"
                  theme="github"
                  height="500px"
                  width="100%"
                  defaultValue={this.state.bodyArr}
                  onChange={(value) => this.setState({ bodyArr: value })}
                  placeholder="html content"
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
                  {this.props.initValue ? "Edit" : "Create"}
               </button>
            </div>
         </>
      );
   }
}
EditPreface.contextType = GlobalContext;

export default EditPreface;

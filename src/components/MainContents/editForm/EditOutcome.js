import React from "react";
import GlobalContext from "../../contexts/ContextProvider";
import { TopologyWrapper } from "../Outcome";
import AceEditor from "react-ace";
import "ace-builds/webpack-resolver";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-github";
import _ from "lodash";

class AddCommandForm extends React.Component {
   state = {
      commandList: [],
      enableCommand: false,
      selectedCommandIndex: null,
      input: {
         data: "",
      },
      isPayloadValid: true,
   };

   clearInputbox = () => {
      this.setState({
         input: {
            data: "",
         },
      });
   };

   componentDidMount() {
      // console.log(this.props.initValue);
      let { initValue } = this.props;
      if (initValue) {
         console.log(initValue);
         this.setState({ enableCommand: true });
      }
   }

   componentDidUpdate(prevProps, prevState) {
      // console.log(this.props.initValue);
      let { initValue } = this.props;
      if (initValue && prevProps.initValue !== this.props.initValue) {
         console.log(this.props.initValue);
         this.setState({
            enableCommand: true,
            commandList: [...initValue],
         });
      } else if (!initValue && prevProps.initValue !== this.props.initValue) {
         this.clearInputbox();
         this.setState({ enableCommand: false, commandList: [], selectedCommandIndex: null });
      }
   }

   getCurrentState = () => {
      return this.state;
   };

   onChangeHandler = (e) => {
      let tmp = [...this.state.commandList];
      tmp[this.state.selectedCommandIndex][e.target.name] = e.target.value;
      this.setState({ commandList: [...tmp] });
   };

   payloadInputHandler = (value) => {
      var tmp = [...this.state.commandList];
      try {
         let data;
         if (value === "") {
            data = undefined;
         } else {
            data = JSON.parse(value);
         }
         tmp[this.state.selectedCommandIndex].data = data;
         this.setState({ commandList: [...tmp], input: { data: value }, isPayloadValid: true });
      } catch (e) {
         this.setState({ input: { data: value }, isPayloadValid: false });
      }
   };

   renderCommand = () => {
      return this.state.commandList.map((el, index) => {
         return (
            <div
               key={index}
               className={`d-flex btn btn-sm btn${this.state.selectedCommandIndex === index ? "" : "-outline"}-info me-2`}
               onClick={() => this.setState({ input: { data: JSON.stringify(el.data, null, 4) }, selectedCommandIndex: index })}
            >
               <span className="me-2">{el.title}</span>
               <span>
                  <i
                     type="button"
                     title="delete"
                     className="fal fa-times-circle icon-hover-highlight"
                     onClick={(e) => {
                        e.stopPropagation();
                        let tmpList = [...this.state.commandList];
                        if (this.state.selectedCommandIndex === index) {
                           this.clearInputbox();
                        }
                        tmpList.splice(index, 1);
                        this.setState({
                           commandList: [...tmpList],
                           selectedCommandIndex:
                              this.state.selectedCommandIndex === index ? null : this.state.selectedCommandIndex,
                        });
                     }}
                  />
               </span>
            </div>
         );
      });
   };

   renderEndpoints() {
      const Context = this.context;
      if (Context.config.endpoints) {
         let endpoints = [];
         for (let endpoint in Context.config.endpoints) {
            endpoints.push(endpoint);
         }
         return endpoints.map((el, index) => {
            return (
               <option key={index} value={el}>
                  {el}
               </option>
            );
         });
      }
   }

   render() {
      return (
         <div className="bg-light rounded-lg">
            <div className="d-flex justify-content-between">
               <div className="px-2 py-1">Command</div>
               <div className="px-2 py-1">
                  <input
                     className="form-check-input"
                     type="checkbox"
                     title="enable command"
                     name="enableCommand"
                     checked={this.state.enableCommand}
                     onChange={() => this.setState({ enableCommand: !this.state.enableCommand })}
                  />
               </div>
            </div>
            {this.state.enableCommand && (
               <div className="px-4 pb-2 border-top">
                  <div className="form-row">
                     <div className="col-sm-12 col-md-1">
                        <div
                           className="btn btn-sm btn-secondary px-4 me-1 my-3"
                           onClick={() => {
                              this.clearInputbox();
                              this.setState({
                                 selectedCommandIndex: this.state.commandList.length,
                                 commandList: [
                                    ...this.state.commandList,
                                    {
                                       type: "request",
                                       useEndpoint: "",
                                       title: "",
                                       url: "",
                                       method: "get",
                                       displayResponseAs: "json",
                                       objectPath: "",
                                       data: undefined,
                                    },
                                 ],
                              });
                           }}
                        >
                           +
                        </div>
                     </div>
                     <div className="col-sm-12 col-md-11">
                        <div className="d-flex overflow-auto my-3">{this.renderCommand()}</div>
                     </div>
                  </div>
                  {this.state.selectedCommandIndex && (
                     <>
                        <div className="form-row">
                           <div className="col">
                              <div className="form-check form-check-inline">
                                 <input
                                    className="form-check-input"
                                    type="radio"
                                    name="type"
                                    id="inlineRadio1"
                                    value="request"
                                    checked={this.state.commandList[this.state.selectedCommandIndex].type === "request"}
                                    onChange={(e) => this.onChangeHandler(e)}
                                 />
                                 <label className="form-check-label" htmlFor="inlineRadio1">
                                    request
                                 </label>
                              </div>
                              <div className="form-check form-check-inline">
                                 <input
                                    className="form-check-input"
                                    type="radio"
                                    name="type"
                                    id="inlineRadio2"
                                    value="polling"
                                    checked={this.state.commandList[this.state.selectedCommandIndex].type === "polling"}
                                    onChange={(e) => this.onChangeHandler(e)}
                                 />
                                 <label className="form-check-label" htmlFor="inlineRadio2">
                                    polling
                                 </label>
                              </div>
                           </div>
                           <div className="col">
                              <select
                                 className="custom-select custom-select-sm"
                                 name="useEndpoint"
                                 onChange={(e) => this.onChangeHandler(e)}
                                 value={this.state.commandList[this.state.selectedCommandIndex].useEndpoint}
                              >
                                 <option value="">Choose endpoint...</option>
                                 {this.renderEndpoints()}
                              </select>
                           </div>
                        </div>
                        <div className="input-group my-2">
                           <select
                              className="custom-select col-sm-2"
                              name="method"
                              value={this.state.commandList[this.state.selectedCommandIndex].method}
                              onChange={(e) => this.onChangeHandler(e)}
                           >
                              <option value="get">GET</option>
                              <option value="post">POST</option>
                              <option value="put">PUT</option>
                              <option value="patch">PATCH</option>
                              <option value="delete">DELETE</option>
                           </select>
                           <input
                              type="text"
                              className="form-control"
                              name="url"
                              placeholder="Enter request URL (ex. /your/path)"
                              value={this.state.commandList[this.state.selectedCommandIndex].url}
                              onChange={(e) => this.onChangeHandler(e)}
                           />
                        </div>
                        <div className="form-row mb-2">
                           <div className="col">
                              <input
                                 type="text"
                                 className="form-control form-control-sm"
                                 name="title"
                                 placeholder="title text"
                                 value={this.state.commandList[this.state.selectedCommandIndex].title}
                                 onChange={(e) => this.onChangeHandler(e)}
                              />
                           </div>
                        </div>
                        <div className="form-row mb-3">
                           <div className="col-sm-12 col-md-2">DisplayResponseAs</div>
                           <div className="col-sm-12 col-md-3">
                              <select
                                 className="custom-select custom-select-sm"
                                 name="displayResponseAs"
                                 value={this.state.commandList[this.state.selectedCommandIndex].displayResponseAs}
                                 onChange={(e) => this.onChangeHandler(e)}
                              >
                                 <option value="json">JSON</option>
                                 <option value="text">PLAIN TEXT</option>
                              </select>
                           </div>
                           {this.state.commandList[this.state.selectedCommandIndex].displayResponseAs === "text" && (
                              <div className="col-sm-12 col-md-7">
                                 <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    name="objectPath"
                                    placeholder="objectPath"
                                    value={this.state.commandList[this.state.selectedCommandIndex].objectPath}
                                    onChange={(e) => this.onChangeHandler(e)}
                                 />
                              </div>
                           )}
                        </div>
                        {this.state.commandList[this.state.selectedCommandIndex].type === "polling" && (
                           <div className="form-row mb-3">
                              <div className="col">
                                 <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    name="maxRetry"
                                    placeholder="maxRetry default = 10"
                                    value={this.state.commandList[this.state.selectedCommandIndex].maxRetry}
                                    onChange={(e) => this.onChangeHandler(e)}
                                 />
                              </div>
                              <div className="col">
                                 <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    name="interval"
                                    placeholder="Interval default = 5000ms"
                                    value={this.state.commandList[this.state.selectedCommandIndex].interval}
                                    onChange={(e) => this.onChangeHandler(e)}
                                 />
                              </div>
                           </div>
                        )}
                        <div className="form-row mb-2">
                           <div className="col">
                              {/* <textarea className="form-control form-control-sm" placeholder="Payload (optional)" /> */}
                              <div>
                                 <span className="me-2 font-sm">Payload (optional)</span>
                                 {!this.state.isPayloadValid ? "invalid JSON" : ""}
                              </div>
                              <AceEditor
                                 mode="json"
                                 theme="github"
                                 height="300px"
                                 width="100%"
                                 value={this.state.input.data ? this.state.input.data : ""}
                                 onChange={(value) => this.payloadInputHandler(value)}
                                 name="data"
                                 className="rounded border"
                                 editorProps={{ $blockScrolling: true }}
                                 showPrintMargin={false}
                              />
                           </div>
                        </div>
                     </>
                  )}
               </div>
            )}
         </div>
      );
   }
}
AddCommandForm.contextType = GlobalContext;

class AddNodeForm extends React.Component {
   constructor(props) {
      super(props);
      this.state = { input: { id: "", label: "", type: "default", width: "30", height: "30", highlight: false } };
      this.addCommandFormRef = React.createRef();
   }
   clearInputbox = () => {
      this.setState({ input: { id: "", label: "", type: "default", width: "30", height: "30", highlight: false } });
   };

   componentDidMount() {
      let { initValue } = this.props;
      if (initValue) {
         let classesArray = [...initValue.classes];
         let index = classesArray.indexOf("highlight");
         if (index > -1) {
            classesArray.splice(index, 1);
         }
         this.setState({
            input: {
               id: initValue.data.id,
               label: initValue.data.label,
               type: classesArray[0],
               width: initValue.style.width,
               height: initValue.style.height,
               highlight: initValue.classes.includes("highlight"),
            },
         });
      }
   }

   componentDidUpdate(prevProps, prevState) {
      let { initValue } = this.props;
      if (initValue && prevProps.initValue !== this.props.initValue) {
         let classesArray = [...initValue.classes];
         let index = classesArray.indexOf("highlight");
         if (index > -1) {
            classesArray.splice(index, 1);
         }
         this.setState({
            input: {
               id: initValue.data.id,
               label: initValue.data.label,
               type: classesArray[0],
               width: initValue.style.width,
               height: initValue.style.height,
               highlight: initValue.classes.includes("highlight"),
            },
         });
      } else if (!initValue && prevProps.initValue !== this.props.initValue) {
         this.clearInputbox();
      }
   }

   addNodeHandler = (e) => {
      e.preventDefault();
      // add node to topology
      let uuid = Math.abs((Math.random() * 0xffffffff) | 0).toString(16);
      let commandState = this.addCommandFormRef.current.getCurrentState();
      let commandList = [...commandState.commandList];
      let nodeObject = {
         data: {
            id: this.state.input.id ? this.state.input.id : uuid,
            label: this.state.input.label,
            width: this.state.input.width,
            height: this.state.input.height,
         },
         classes: `${this.state.input.type} ${this.state.input.highlight ? "highlight" : ""}`,
      };
      if (commandState.enableCommand) {
         // enable command
         nodeObject.commands = commandList;
      } else {
         // disable command
         nodeObject.commands = null;
      }
      console.log(nodeObject);
      this.props.onAddElement(nodeObject, "node");
      this.clearInputbox();
   };

   render() {
      return (
         <>
            <form onSubmit={this.addNodeHandler}>
               <div className="form-group">
                  <div className="form-row">
                     <div className="col-sm-3">
                        <label>Label</label>
                        <input
                           type="text"
                           className="form-control form-control-sm"
                           placeholder="label"
                           name="label"
                           value={this.state.input.label}
                           onChange={(e) => this.setState({ input: { ...this.state.input, [e.target.name]: e.target.value } })}
                        />
                     </div>
                     <div className="col-sm-3">
                        <label>Appearance</label>
                        <select
                           className="custom-select custom-select-sm"
                           name="type"
                           value={this.state.input.type}
                           onChange={(e) => this.setState({ input: { ...this.state.input, [e.target.name]: e.target.value } })}
                        >
                           <option value="default">Default</option>
                           <option value="router">Router</option>
                        </select>
                     </div>
                     <div className="col-sm-6">
                        <label>
                           Size <span className="font-sm">(Width x Height)</span>
                        </label>
                        <div className="input-group input-group-sm mb-3">
                           <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Width"
                              required
                              name="width"
                              value={this.state.input.width}
                              onChange={(e) => this.setState({ input: { ...this.state.input, [e.target.name]: e.target.value } })}
                           />
                           <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Height"
                              required
                              name="height"
                              value={this.state.input.height}
                              onChange={(e) => this.setState({ input: { ...this.state.input, [e.target.name]: e.target.value } })}
                           />
                        </div>
                     </div>
                  </div>
                  <div className="form-check">
                     <input
                        className="form-check-input"
                        type="checkbox"
                        id="hilight"
                        name="highlight"
                        checked={this.state.input.highlight}
                        onChange={(e) => this.setState({ input: { ...this.state.input, [e.target.name]: e.target.checked } })}
                     />
                     <label className="form-check-label" htmlFor="hilight">
                        Highlight
                     </label>
                  </div>
               </div>
               <AddCommandForm
                  ref={this.addCommandFormRef}
                  initValue={this.props.initValue ? this.props.initValue.commands : null}
               />
               <button type="submit" className="btn btn-sm btn-primary my-1">
                  {this.props.initValue ? "Update" : "Add"}
               </button>
            </form>
         </>
      );
   }
}

class AddEdgeForm extends React.Component {
   state = { input: { id: "", source: "", target: "", label: "", highlight: false, dashed: false, curveline: false } };
   clearInputbox = () => {
      this.setState({ input: { id: "", source: "", target: "", label: "", highlight: false, dashed: false, curveline: false } });
   };

   componentDidMount() {
      let { initValue } = this.props;
      if (initValue) {
         this.setState({
            input: {
               id: initValue.data.id,
               source: initValue.data.source,
               target: initValue.data.target,
               label: initValue.data.label || "",
               highlight: initValue.classes.includes("highlight"),
               dashed: initValue.classes.includes("dashed"),
               curveline: initValue.classes.includes("curve-multiple"),
            },
         });
      }
   }

   componentDidUpdate(prevProps, prevState) {
      let { initValue } = this.props;
      if (initValue && prevProps.initValue !== this.props.initValue) {
         this.setState({
            input: {
               id: initValue.data.id,
               source: initValue.data.source,
               target: initValue.data.target,
               label: initValue.data.label || "",
               highlight: initValue.classes.includes("highlight"),
               dashed: initValue.classes.includes("dashed"),
               curveline: initValue.classes.includes("curve-multiple"),
            },
         });
      } else if (!initValue && prevProps.initValue !== this.props.initValue) {
         this.clearInputbox();
      }
   }

   renderNodeSelectOption = () => {
      if (this.props.nodeList)
         return this.props.nodeList.map((el, index) => {
            return (
               <option key={index} value={el.data.id}>
                  {el.data.label}
               </option>
            );
         });
   };

   addEdgeHandler = (e) => {
      e.preventDefault();
      let uuid = Math.abs((Math.random() * 0xffffffff) | 0).toString(16);
      let edgeObject = {
         data: {
            id: this.state.input.id ? this.state.input.id : uuid,
            source: this.state.input.source,
            target: this.state.input.target,
            label: this.state.input.label !== null ? this.state.input.label : "",
         },
         classes: `${this.state.input.highlight ? "highlight" : ""} ${this.state.input.curveline ? "curve-multiple" : ""} ${
            this.state.input.dashed ? "dashed" : ""
         }`,
      };
      this.props.onAddElement(edgeObject, "edge");
      this.clearInputbox();
   };

   render() {
      return (
         <>
            <form onSubmit={this.addEdgeHandler}>
               <div className="form-group">
                  <div className="form-row">
                     <div className="col-sm-3">
                        <label>Source</label>
                        <select
                           className="custom-select custom-select-sm"
                           required
                           name="source"
                           value={this.state.input.source}
                           onChange={(e) => this.setState({ input: { ...this.state.input, [e.target.name]: e.target.value } })}
                        >
                           <option value="">Choose...</option>
                           {this.renderNodeSelectOption()}
                        </select>
                     </div>
                     <div className="col-sm-3">
                        <label>Target</label>
                        <select
                           className="custom-select custom-select-sm"
                           required
                           name="target"
                           value={this.state.input.target}
                           onChange={(e) => this.setState({ input: { ...this.state.input, [e.target.name]: e.target.value } })}
                        >
                           <option value="">Choose...</option>
                           {this.renderNodeSelectOption()}
                        </select>
                     </div>
                     <div className="col-sm-3">
                        <label>Label (optional)</label>
                        <input
                           type="text"
                           className="form-control form-control-sm"
                           placeholder="label"
                           name="label"
                           value={this.state.input.label}
                           onChange={(e) => this.setState({ input: { ...this.state.input, [e.target.name]: e.target.value } })}
                        />
                     </div>
                     <div className="col-sm-2 ms-3">
                        <label>Appearance</label>
                        <div className="form-check">
                           <input
                              className="form-check-input"
                              type="checkbox"
                              id="highlight-checkbox"
                              name="highlight"
                              checked={this.state.input.highlight}
                              onChange={(e) =>
                                 this.setState({ input: { ...this.state.input, [e.target.name]: e.target.checked } })
                              }
                           />
                           <label className="form-check-label" htmlFor="highlight-checkbox">
                              Highlight
                           </label>
                        </div>
                        <div className="form-check">
                           <input
                              className="form-check-input"
                              type="checkbox"
                              id="dashed-checkbox"
                              name="dashed"
                              checked={this.state.input.dashed}
                              onChange={(e) =>
                                 this.setState({ input: { ...this.state.input, [e.target.name]: e.target.checked } })
                              }
                           />
                           <label className="form-check-label" htmlFor="dashed-checkbox">
                              Dashed
                           </label>
                        </div>
                        <div className="form-check">
                           <input
                              className="form-check-input"
                              type="checkbox"
                              id="curve-line-checkbox"
                              name="curveline"
                              checked={this.state.input.curveline}
                              onChange={(e) =>
                                 this.setState({ input: { ...this.state.input, [e.target.name]: e.target.checked } })
                              }
                           />
                           <label className="form-check-label" htmlFor="curve-line-checkbox">
                              Curve line
                           </label>
                        </div>
                     </div>
                  </div>
               </div>
               <button type="submit" className="btn btn-sm btn-primary my-1">
                  {this.props.initValue ? "Update" : "Add"}
               </button>
            </form>
         </>
      );
   }
}

class EditOutcome extends React.Component {
   constructor(props) {
      super(props);
      this.topologyRef = React.createRef();
      this.state = {
         outcome: this.props.initValue || { elements: { nodes: [], edges: [] }, commands: {} },
         selectedNode: null,
         selectedEdge: null,
         formShow: "node",
      };
   }

   deleteElementHandler = () => {
      let newOutcome = { ...this.state.outcome };
      if (this.state.selectedNode) {
         // delete node
         newOutcome.elements.nodes = newOutcome.elements.nodes.filter((el) => {
            return el.data.id !== this.state.selectedNode.data.id;
         });
         // delete command on node
         if (newOutcome.commands[this.state.selectedNode.data.id]) {
            delete newOutcome.commands[this.state.selectedNode.data.id];
         }
         // update state
         this.setState({ outcome: { ...newOutcome }, selectedNode: null });
      } else if (this.state.selectedEdge) {
         // delete edge
         newOutcome.elements.edges = newOutcome.elements.edges.filter((el) => {
            return el.data.id !== this.state.selectedEdge.data.id;
         });
         // update state
         this.setState({ outcome: { ...newOutcome }, selectedEdge: null });
      }
   };

   saveHandler = () => {
      const Context = this.context;
      let currentObjectData = this.topologyRef.current.getObjectData();
      let currentConfig = _.cloneDeep(Context.config);
      console.log(currentObjectData);
      currentConfig.mainContent[Context.currentStep.name].outcome.elements = { ...currentObjectData };
      currentConfig.mainContent[Context.currentStep.name].outcome.commands = { ...this.state.outcome.commands };
      Context.updateConfig(currentConfig);
      this.props.onHide();
   };

   addElementHandler = (element, type) => {
      if (type === "node") {
         let id = element.data.id;
         let newOutcome = _.cloneDeep(this.state.outcome);
         let isElementExisted = newOutcome.elements.nodes.some((el) => el.data.id === id);
         let newElement = { data: element.data, classes: element.classes };
         if (isElementExisted) {
            newOutcome.elements.nodes = newOutcome.elements.nodes.map((el) => {
               return el.data.id === id ? newElement : el;
            });
         } else {
            newOutcome.elements.nodes.push(newElement);
         }
         if (element.commands) {
            // Add command to node
            newOutcome.commands[id] = element.commands;
         } else {
            // Remove command from node
            delete newOutcome.commands[id];
         }
         this.setState({ outcome: newOutcome, selectedNode: null });
      } else if (type === "edge") {
         let id = element.data.id;
         let newOutcome = _.cloneDeep(this.state.outcome);
         let isElementExisted = newOutcome.elements.edges.some((el) => el.data.id === id);
         if (isElementExisted) {
            newOutcome.elements.edges = newOutcome.elements.edges.map((el) => {
               return el.data.id === id ? element : el;
            });
         } else {
            newOutcome.elements.edges.push(element);
         }
         this.setState({ outcome: newOutcome, selectedEdge: null });
      }
   };

   elementClickHandler = (element) => {
      // console.log(element.position());
      if (element.isNode()) {
         this.setState({
            selectedNode: {
               data: element.data(),
               style: element.style(),
               classes: element.classes(),
               commands: this.state.outcome.commands[element.data().id],
            },
            selectedEdge: null,
            formShow: "node",
         });
      } else if (element.isEdge()) {
         this.setState({
            selectedNode: null,
            selectedEdge: {
               data: element.data(),
               style: element.style(),
               classes: element.classes(),
               commands: this.state.outcome.commands[element.data().id],
            },
            formShow: "edge",
         });
      }
   };

   render() {
      let selectedElementId = "";
      if (this.state.selectedNode) {
         selectedElementId = this.state.selectedNode.data.id;
      } else if (this.state.selectedEdge) {
         selectedElementId = this.state.selectedEdge.data.id;
      }
      return (
         <>
            <div className="modal-header">
               <span className="modal-title">Outcome Editor</span>
               <button type="button" className="btn-close" onClick={this.props.onHide}></button>
            </div>
            <div className="modal-body">
               <div className="row">
                  <div className="btn-group btn-group-sm col-4">
                     <button
                        type="button"
                        className={`btn btn-${this.state.formShow === "edge" ? "outline-" : ""}secondary`}
                        onClick={() => this.setState({ formShow: "node", selectedNode: null, selectedEdge: null })}
                     >
                        Node
                     </button>
                     <button
                        type="button"
                        className={`btn btn-${this.state.formShow === "node" ? "outline-" : ""}secondary`}
                        onClick={() => this.setState({ formShow: "edge", selectedNode: null, selectedEdge: null })}
                     >
                        Edge
                     </button>
                  </div>
               </div>
               <div className="border rounded p-3" style={{ marginTop: "-1px" }}>
                  <div className="row">
                     <div className="col-md-4">
                        <div className="d-flex justify-content-between">
                           <div className="input-group input-group-sm">
                              <div className="input-group-prepend">
                                 <span className="input-group-text">Element ID</span>
                              </div>
                              <input type="text" className="form-control" disabled value={selectedElementId} />
                           </div>
                           <div className="mx-2">
                              <i
                                 type="button"
                                 title="de-select"
                                 className="fal fa-times-circle icon-hover-highlight"
                                 onClick={() => this.setState({ selectedEdge: null, selectedNode: null })}
                              />
                           </div>
                        </div>
                     </div>
                     <div className="col-md-2 offset-md-6">
                        <button
                           type="button"
                           title="Delete selected element"
                           className="btn btn-danger btn-sm float-right"
                           disabled={!this.state.selectedNode && !this.state.selectedEdge}
                           onClick={this.deleteElementHandler}
                        >
                           Delete
                        </button>
                     </div>
                  </div>
                  <div className="mt-2">
                     {this.state.formShow === "node" ? (
                        <AddNodeForm
                           onAddElement={this.addElementHandler}
                           nodeList={this.state.outcome.elements.nodes}
                           edgeList={this.state.outcome.elements.edges}
                           initValue={this.state.selectedNode}
                        />
                     ) : (
                        <AddEdgeForm
                           onAddElement={this.addElementHandler}
                           nodeList={this.state.outcome.elements.nodes}
                           edgeList={this.state.outcome.elements.edges}
                           initValue={this.state.selectedEdge}
                        />
                     )}
                  </div>
               </div>
               <div>
                  <div className="p-2">
                     Preview
                     <span className="font-sm font-italic font-weight-light text-muted ms-3">
                        Click on the element below to edit parameters
                     </span>
                  </div>
                  <div className="border rounded">
                     <TopologyWrapper
                        ref={this.topologyRef}
                        outcomeConfig={this.state.outcome}
                        onNodeClick={this.elementClickHandler}
                     />
                  </div>
               </div>
            </div>
            <div className="modal-footer p-1">
               <button type="button" className="btn btn-sm" onClick={this.props.onHide}>
                  Close
               </button>
               <button type="button" className="btn btn-primary btn-sm" onClick={this.saveHandler}>
                  Commit Change
               </button>
            </div>
         </>
      );
   }
}
EditOutcome.contextType = GlobalContext;

export default EditOutcome;

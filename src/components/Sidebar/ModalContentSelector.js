import React from "react";
import GlobalContext from "../contexts/ContextProvider";

class EndpointEditor extends React.Component {
   state = { input: { name: "", baseURL: "" }, inputHeader: [] };

   componentDidMount() {
      let { initValue } = this.props;
      if (initValue) {
         this.setState({
            input: { name: initValue.name, baseURL: initValue.baseURL },
            inputHeader: Object.keys(initValue.headers).map((key) => ({ key: key, value: initValue.headers[key] })),
         });
      }
   }

   onChangeHandler = (e) => {
      this.setState({ input: { ...this.state.input, [e.target.name]: e.target.value } });
   };

   onHeaderChangeHandler = (e, index) => {
      let currentHeader = this.state.inputHeader;
      currentHeader[index] = { ...currentHeader[index], [e.target.name]: e.target.value };
      this.setState({ inputHeader: currentHeader });
   };

   onHeaderSaveHandler = () => {
      let Context = this.context;
      Context.addEndpoint(this.state.input.name, this.state.input.baseURL, this.state.inputHeader);
      this.props.onClose();
   };

   renderHeaderField = () => {
      return this.state.inputHeader.map((el, index) => {
         return (
            <React.Fragment key={index}>
               <div className="col-11">
                  <div className="input-group" style={{ marginTop: "-1px" }}>
                     <input
                        type="text"
                        className="form-control form-control-sm"
                        name="key"
                        placeholder="key"
                        required
                        value={el.key || ""}
                        onChange={(e) => this.onHeaderChangeHandler(e, index)}
                     />
                     <input
                        type="text"
                        className="form-control form-control-sm"
                        name="value"
                        placeholder="value"
                        required
                        value={el.value || ""}
                        onChange={(e) => this.onHeaderChangeHandler(e, index)}
                     />
                  </div>
               </div>
               <div className="col-1">
                  <span
                     className="pointer"
                     onClick={() => this.setState({ inputHeader: this.state.inputHeader.filter((el, i) => i !== index) })}
                  >
                     {"\u00D7"}
                  </span>
               </div>
            </React.Fragment>
         );
      });
   };

   render() {
      return (
         <div className="endpoint-form">
            <div className="d-flex align-items-center">
               <div>New Endpoint</div>
               <div className="btn btn-sm btn-info ms-auto" onClick={this.onHeaderSaveHandler}>
                  Save
               </div>
            </div>
            <div className="col-11">
               <div className="input-group my-3">
                  <input
                     style={{ maxWidth: 200 }}
                     type="text"
                     className="form-control"
                     name="name"
                     placeholder="Endpoint Name"
                     required
                     value={this.state.input.name}
                     onChange={this.onChangeHandler}
                  />
                  <input
                     type="text"
                     className="form-control"
                     name="baseURL"
                     placeholder="Enter baseURL"
                     required
                     value={this.state.input.baseURL}
                     onChange={this.onChangeHandler}
                  />
               </div>
            </div>
            <div className="mb-3">Header</div>
            <div className="row">{this.renderHeaderField()}</div>
            <div className="text-center text-info font-lg">
               <i
                  type="button"
                  className="fad fa-plus-circle icon-hover-highlight"
                  onClick={() => this.setState({ inputHeader: [...this.state.inputHeader, {}] })}
               />
            </div>
         </div>
      );
   }
}
EndpointEditor.contextType = GlobalContext;

class EndpointViewer extends React.Component {
   state = { showDeleteEndpoint: [] };

   onSelectHandler = (name, el) => {
      this.props.onSelect({ name: name, baseURL: el.baseURL, headers: el.headers });
   };

   renderEndpoint() {
      let Context = this.context;
      return Object.keys(Context.config.endpoints).map((endpointName, index) => {
         return (
            <div key={index} className="row">
               <div className="mb-2 col-10">
                  <div
                     className="input-group input-group-sm pointer"
                     onClick={() => this.onSelectHandler(endpointName, Context.config.endpoints[endpointName])}
                  >
                     <div type="text" className="form-control col-3">
                        {endpointName}
                     </div>
                     <div type="text" className="form-control col-9">
                        {Context.config.endpoints[endpointName].baseURL}
                     </div>
                  </div>
               </div>

               <div className="col-2">
                  {this.state.showDeleteEndpoint.includes(index) ? (
                     <>
                        <span
                           className="pointer font-sm"
                           onClick={() =>
                              this.setState({ showDeleteEndpoint: this.state.showDeleteEndpoint.filter((el) => el !== index) })
                           }
                        >
                           Cancel
                        </span>
                        <span
                           className="pointer font-sm text-danger mx-2 text-hover-highlight"
                           onClick={() => Context.deleteEndpoint(endpointName)}
                        >
                           Delete
                        </span>
                     </>
                  ) : (
                     <span
                        className="pointer"
                        onClick={() => this.setState({ showDeleteEndpoint: [...this.state.showDeleteEndpoint, index] })}
                     >
                        {"\u00D7"}
                     </span>
                  )}
               </div>
            </div>
         );
      });
   }

   render() {
      return <div className="mb-3">{this.renderEndpoint()}</div>;
   }
}
EndpointViewer.contextType = GlobalContext;

class Settings extends React.Component {
   state = { selectedEndpoint: null, showEndpointEditor: false };
   render() {
      return (
         <>
            <div className="modal-header">
               <span className="modal-title">Settings</span>
               <button type="button" className="btn-close" onClick={this.props.onHide}></button>
            </div>
            <div className="modal-body">
               <div className="mb-3">
                  Endpoint
                  <span
                     className="mx-3 font-sm text-info pointer text-hover-highlight"
                     onClick={() => this.setState({ showEndpointEditor: true })}
                  >
                     Add
                  </span>
               </div>
               <EndpointViewer onSelect={(el) => this.setState({ selectedEndpoint: el, showEndpointEditor: true })} />
               {this.state.showEndpointEditor && (
                  <EndpointEditor
                     initValue={this.state.selectedEndpoint}
                     onClose={() => this.setState({ showEndpointEditor: false, selectedEndpoint: null })}
                  />
               )}
            </div>
            <div className="modal-footer">
               <button type="button" className="btn btn-sm btn-danger" onClick={this.props.onHide}>
                  Close
               </button>
            </div>
         </>
      );
   }
}

class ModalContentSelector extends React.Component {
   render() {
      const { contentType } = this.props;
      if (contentType === "settings") {
         return <Settings {...this.props} />;
      } else {
         return null;
      }
   }
}

export default ModalContentSelector;

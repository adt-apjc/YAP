import React from "react";
import GlobalContext from "../contexts/ContextProvider";
import { Modal } from "../../helper/modalHelper";
import ModalContentSelector from "./editForm/ModalContentSelector";
import { isArray, isEmpty, isEqual } from "lodash";
import Logo from "./Logo";

class PrefaceContent extends React.Component {
   render() {
      let texts = this.props.config.bodyArr;
      if (isArray(texts)) {
         texts = this.props.config.bodyArr.map((element, textIndex) => {
            return (
               <div key={textIndex} className="card-text text-justify p-2 m-0" dangerouslySetInnerHTML={{ __html: element }} />
            );
         });
      }
      return (
         <>
            <h3 className="mx-auto d-block text-center px-3 pt-3 m-0">{this.props.config.title}</h3>
            <div className="card-body m-0 pb-3 px-3">{texts}</div>
         </>
      );
   }
}

class Preface extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
         preface: { ...this.props.config[0] },
         index: 0,
         modalShow: false,
         modalContentType: null,
         paramValues: null,
      };
   }

   componentDidUpdate(prevProps, prevState) {
      if (!isEqual(prevProps, this.props)) {
         console.log(this.props);
         this.setState({ preface: { ...(this.props.config[this.state.index] || this.props.config[0]) } });
      }
   }

   render() {
      const { preface, index } = this.state;
      let Context = this.context;
      if (!isEmpty(preface)) {
         return (
            <div className="pb-3">
               <div className="btn-toolbar justify-content-between position-relative">
                  <Logo />
                  <div className="d-flex align-items-center mt-1">
                     <ul className="nav nav-tabs preface-nav">
                        {this.props.config.map((element, stepIndex) => {
                           return (
                              <li
                                 key={stepIndex}
                                 className="nav-item pointer"
                                 onClick={() =>
                                    this.setState({
                                       preface: { ...this.props.config[stepIndex] },
                                       index: stepIndex,
                                    })
                                 }
                              >
                                 <a className={stepIndex === index ? "nav-link active" : "nav-link text-black-50"}>
                                    {element.stepDesc}
                                 </a>
                              </li>
                           );
                        })}
                     </ul>
                     {Context.mode === "edit" && (
                        <div
                           className="ms-3 pointer"
                           onClick={() => this.setState({ modalShow: true, modalContentType: "editPreface" })}
                        >
                           <i className="far fa-plus text-primary" />
                        </div>
                     )}
                  </div>
               </div>
               <div className="h-100">
                  <div className="d-block border rounded">
                     {Context.mode === "edit" && (
                        <div className="float-right p-3">
                           <span
                              className="px-1 font-sm font-weight-light text-info text-hover-highlight pointer"
                              onClick={() =>
                                 this.setState({
                                    modalShow: true,
                                    modalContentType: "editPreface",
                                    paramValues: { index: this.state.index, config: preface },
                                 })
                              }
                           >
                              Edit
                           </span>
                           <span
                              className="px-1 font-sm font-weight-light text-danger text-hover-highlight pointer"
                              onClick={() =>
                                 this.setState({
                                    modalShow: true,
                                    modalContentType: "prefaceDeleteConfirm",
                                    paramValues: { index: this.state.index, config: preface },
                                 })
                              }
                           >
                              Delete
                           </span>
                        </div>
                     )}
                     <PrefaceContent config={preface} index={index} />
                  </div>
               </div>
               <Modal
                  show={this.state.modalShow}
                  onHide={() => this.setState({ modalShow: false, modalContentType: null, paramValues: null })}
               >
                  <ModalContentSelector
                     onHide={() => this.setState({ modalShow: false, modalContentType: null, paramValues: null })}
                     contentType={this.state.modalContentType}
                     initValue={this.state.paramValues}
                  />
               </Modal>
            </div>
         );
      } else {
         return <span>No configuration</span>;
      }
   }
}
Preface.contextType = GlobalContext;

export default Preface;

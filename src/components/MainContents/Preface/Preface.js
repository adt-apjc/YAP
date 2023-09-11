import React, { useState, useEffect } from "react";
import { useGlobalContext } from "../../contexts/ContextProvider";
import { Modal } from "../../../helper/modalHelper";
import ModalContentSelector from "../editForm/ModalContentSelector";
import { isArray } from "lodash";

const PrefaceContent = ({ config, index }) => {
   if (!config) return null;

   let texts;
   if (isArray(config.bodyArr))
      texts = config.bodyArr.map((element, textIndex) => {
         return <div key={textIndex} className="text-justify p-2 m-0" dangerouslySetInnerHTML={{ __html: element }} />;
      });

   return (
      <>
         <h3 className="mx-auto d-block text-center px-3 pt-3 m-0">{config.title}</h3>
         <div className="card-body m-0 pb-3 px-3">{texts}</div>
      </>
   );
};

const Preface = (props) => {
   const { context } = useGlobalContext();
   const [state, setState] = useState({
      preface: props.prefaceRef ? context.config.preface[props.prefaceRef] : context.config.preface[0],
      index: props.prefaceRef ? props.prefaceRef : 0,
      modalShow: false,
      modalContentType: null,
      paramValues: null,
   });

   useEffect(() => {
      setState({ ...state, index: props.prefaceRef, preface: context.config.preface[props.prefaceRef] });
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [props.prefaceRef]);

   useEffect(() => {
      setState({ ...state, preface: context.config.preface[state.index] }); // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [context.config.preface]);

   return (
      <div className="p-1">
         <div className="btn-toolbar justify-content-end position-relative">
            <div className="d-flex align-items-center mt-1">
               <ul className="nav nav-tabs preface-nav">
                  {context.config.preface.map((element, stepIndex) => {
                     return (
                        <li
                           key={stepIndex}
                           className="nav-item pointer"
                           onClick={() =>
                              setState({
                                 ...state,
                                 preface: context.config.preface[stepIndex],
                                 index: stepIndex,
                              })
                           }
                        >
                           <p className={stepIndex === state.index ? "nav-link active" : "nav-link text-black-50"}>
                              {element.stepDesc}
                           </p>
                        </li>
                     );
                  })}
               </ul>
               {context.mode === "edit" && (
                  <div
                     className="ms-3 pointer"
                     onClick={() => setState({ ...state, modalShow: true, modalContentType: "editPreface" })}
                  >
                     <i className="far fa-plus text-primary" />
                  </div>
               )}
            </div>
         </div>
         <div className="h-100">
            <div className="d-block border rounded">
               {context.mode === "edit" && (
                  <div className="float-right p-3">
                     <span
                        className="px-1 font-sm font-weight-light text-info text-hover-highlight pointer"
                        onClick={() =>
                           setState({
                              ...state,
                              modalShow: true,
                              modalContentType: "editPreface",
                              paramValues: { index: state.index, config: state.preface },
                           })
                        }
                     >
                        Edit
                     </span>
                     <span
                        className="px-1 font-sm font-weight-light text-danger text-hover-highlight pointer"
                        onClick={() =>
                           setState({
                              ...state,
                              modalShow: true,
                              modalContentType: "prefaceDeleteConfirm",
                              paramValues: { index: state.index, config: state.preface },
                           })
                        }
                     >
                        Delete
                     </span>
                  </div>
               )}
               <PrefaceContent config={state.preface} index={state.index} />
            </div>
         </div>
         <Modal
            show={state.modalShow}
            onHide={() => setState({ ...state, modalShow: false, modalContentType: null, paramValues: null })}
         >
            <ModalContentSelector
               onHide={() => setState({ ...state, modalShow: false, modalContentType: null, paramValues: null })}
               contentType={state.modalContentType}
               initValue={state.paramValues}
            />
         </Modal>
      </div>
   );
};

export default Preface;

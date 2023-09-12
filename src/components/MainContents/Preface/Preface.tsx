import { useState, useEffect } from "react";
import { useGlobalContext } from "../../contexts/ContextProvider";
import { Modal } from "../../../helper/modalHelper";
import ModalContentSelector from "../editForm/ModalContentSelector";
import { isArray } from "lodash";
import { PrefaceConfig } from "../../contexts/ContextTypes";

type PrefaceState = {
   preface: PrefaceConfig;
   index: number;
   modalShow: boolean;
   modalContentType: string | null;
   paramValues: any;
};

const PrefaceContent = ({ config }: { config: PrefaceConfig }) => {
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

const Preface = (props: { prefaceRef: number; config: PrefaceConfig[] }) => {
   const { context } = useGlobalContext();
   const [state, setState] = useState<PrefaceState>({
      preface: props.prefaceRef ? props.config[props.prefaceRef] : props.config[0],
      index: props.prefaceRef ? props.prefaceRef : 0,
      modalShow: false,
      modalContentType: null,
      paramValues: null,
   });

   useEffect(() => {
      if (props.prefaceRef) setState({ ...state, index: props.prefaceRef, preface: props.config[props.prefaceRef] });
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [props.prefaceRef]);

   return (
      <div className="p-1">
         <div className="btn-toolbar justify-content-end position-relative">
            <div className="d-flex align-items-center mt-1">
               <ul className="nav nav-tabs preface-nav">
                  {props.config.map((element, stepIndex) => {
                     return (
                        <li
                           key={stepIndex}
                           className="nav-item pointer"
                           onClick={() =>
                              setState({
                                 ...state,
                                 preface: props.config[stepIndex],
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
               <PrefaceContent config={state.preface} />
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

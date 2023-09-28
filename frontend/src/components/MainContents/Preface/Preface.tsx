import { useState, useEffect } from "react";
import { useGlobalContext } from "../../contexts/ContextProvider";
import { Modal } from "../../../helper/modalHelper";
import ModalContentSelector from "../editForm/ModalContentSelector";
import { PrefaceConfig } from "../../contexts/ContextTypes";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

type PrefaceState = {
   index: number;
   modalShow: boolean;
   modalContentType: string | null;
   paramValues: any;
};

const PrefaceContent = ({ config }: { config: PrefaceConfig }) => {
   if (!config) return null;

   return (
      <div className="p-5">
         <ReactMarkdown
            children={config.bodyMarkdown}
            // @ts-ignore
            rehypePlugins={[rehypeRaw]}
         />
      </div>
   );
};

const Preface = (props: { prefaceRef: number | undefined; config: PrefaceConfig[] }) => {
   const { context, dispatch } = useGlobalContext();
   const [state, setState] = useState<PrefaceState>({
      index: props.prefaceRef ? props.prefaceRef : 0,
      modalShow: false,
      modalContentType: null,
      paramValues: null,
   });

   const onDragEnd = (result: DropResult) => {
      if (!result.destination) {
         return;
      }

      if (result.destination.index === result.source.index) {
         return;
      }

      console.log(context.currentStep.name!);
      dispatch({
         type: "reorderPrefaceItem",
         payload: {
            source: result.source.index,
            destination: result.destination.index,
         },
      });
   };

   useEffect(() => {
      if (!props.prefaceRef) return;
      if (props.prefaceRef < 0 || props.prefaceRef >= props.config.length) setState({ ...state, index: 0 });
      else setState({ ...state, index: props.prefaceRef });
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [props.prefaceRef]);

   let prefaceItemList: React.ReactNode;
   if (props.config.length > 0) {
      prefaceItemList = props.config.map((element, stepIndex) => {
         return (
            <Draggable
               draggableId={`${element.stepDesc}-${stepIndex}`}
               index={stepIndex}
               key={stepIndex}
               isDragDisabled={context.mode === "presentation"}
            >
               {(provided) => (
                  <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                     <div
                        className="nav-item pointer"
                        onClick={() =>
                           setState({
                              ...state,
                              index: stepIndex,
                           })
                        }
                     >
                        <p className={stepIndex === state.index ? "nav-link active" : "nav-link text-black-50"}>
                           {element.stepDesc}
                        </p>
                     </div>
                  </div>
               )}
            </Draggable>
         );
      });
   }

   return (
      <div className="p-1">
         <div className="btn-toolbar justify-content-end position-relative">
            <div className="d-flex align-items-center ">
               <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable
                     droppableId="prefaceItem"
                     type="prefaceItem"
                     isDropDisabled={context.mode === "presentation"}
                     direction="horizontal"
                  >
                     {(provided) => (
                        <div className="d-flex align-items-center " ref={provided.innerRef} {...provided.droppableProps}>
                           {/* Content list */}
                           <ul className="nav nav-tabs preface-nav">{prefaceItemList}</ul>
                           {provided.placeholder}
                        </div>
                     )}
                  </Droppable>
               </DragDropContext>

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
                        className="px-1 font-sm fw-light text-info text-hover-highlight pointer"
                        onClick={() =>
                           setState({
                              ...state,
                              modalShow: true,
                              modalContentType: "editPreface",
                              paramValues: { index: state.index, config: props.config[state.index] },
                           })
                        }
                     >
                        Edit
                     </span>
                     <span
                        className="px-1 font-sm fw-light text-danger text-hover-highlight pointer"
                        onClick={() =>
                           setState({
                              ...state,
                              modalShow: true,
                              modalContentType: "prefaceDeleteConfirm",
                              paramValues: { index: state.index, config: props.config[state.index] },
                           })
                        }
                     >
                        Delete
                     </span>
                  </div>
               )}
               <PrefaceContent config={props.config[state.index]} />
            </div>
         </div>
         <Modal
            show={state.modalShow}
            onHide={() => setState({ ...state, modalShow: false, modalContentType: null, paramValues: null })}
         >
            <ModalContentSelector
               onHide={() => setState({ ...state, modalShow: false, modalContentType: null, paramValues: null })}
               contentType={state.modalContentType || ""}
               initValue={state.paramValues}
            />
         </Modal>
      </div>
   );
};

export default Preface;

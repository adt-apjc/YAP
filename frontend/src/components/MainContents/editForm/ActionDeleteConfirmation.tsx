import { useGlobalContext } from "../../contexts/ContextProvider";
import { ActionConfig } from "../../contexts/ContextTypes";

type ActionDeleteConfirmationProps = {
   onHide: () => void;
   initValue: { action: ActionConfig; actionIndex: number; tab: "actions" | "preCheck" | "postCheck" };
};

const ActionDeleteConfirmation = (props: ActionDeleteConfirmationProps) => {
   const { context, dispatch } = useGlobalContext();

   const onDeleteHandler = () => {
      if (!context.currentStep.name) return;

      dispatch({
         type: "deleteAction",
         payload: { stepKey: context.currentStep.name, tab: props.initValue.tab, index: props.initValue.actionIndex },
      });

      props.onHide();
   };

   return (
      <>
         <div className="modal-header">
            <span className="modal-title">Confirm Deletion</span>
            <button type="button" className="btn-close" onClick={props.onHide}></button>
         </div>
         <div className="modal-body">
            Title: <span className="text-danger fw-light fst-italic">{props.initValue.action.title}</span>
         </div>
         <div className="modal-footer p-1">
            <button type="button" className="btn btn-sm" onClick={props.onHide}>
               Close
            </button>
            <button type="button" className="btn btn-danger btn-sm" onClick={onDeleteHandler}>
               Delete
            </button>
         </div>
      </>
   );
};

export default ActionDeleteConfirmation;

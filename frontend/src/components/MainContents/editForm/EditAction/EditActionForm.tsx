import { useState } from "react";
import { ActionFormProps } from "./EditAction";
import RestAPIForm from "./RestAPIForm";
import SSHCliForm from "./SSHCliForm";

const actionTypeOptions = { request: "rest-api", polling: "rest-api", "ssh-cli": "ssh-cli" } as const;

const ActionForm = (props: ActionFormProps) => {
   const [actionType, setActionType] = useState<"rest-api" | "ssh-cli">(
      actionTypeOptions[props.initValue ? (props.initValue.action.type as keyof typeof actionTypeOptions) : "request"],
   );

   const renderForm = () => {
      if (actionType === "rest-api") {
         return <RestAPIForm {...props} />;
      } else if (actionType === "ssh-cli") {
         return <SSHCliForm {...props} />;
      }
   };

   return (
      <>
         <div className="modal-header">
            <div>
               <span className="modal-title me-3">
                  {props.initValue ? "Edit" : "Add"} {props.tab}
               </span>
               <div className="btn-group btn-group-xs">
                  <button
                     type="button"
                     className={`btn btn-outline-secondary ${actionType === "rest-api" && "active"}`}
                     onClick={() => setActionType("rest-api")}
                  >
                     REST
                  </button>
                  <button
                     type="button"
                     className={`btn btn-outline-secondary ${actionType === "ssh-cli" && "active"}`}
                     onClick={() => setActionType("ssh-cli")}
                  >
                     CLI
                  </button>
               </div>
            </div>
            <button type="button" className="btn-close" onClick={props.onHide}></button>
         </div>
         <div className="modal-body">{renderForm()}</div>
         <div className="modal-footer p-1">
            <button type="button" className="btn btn-sm" onClick={props.onHide}>
               Close
            </button>
            <button type="submit" className="btn btn-primary btn-sm" form="actionForm">
               {props.initValue ? "Update" : "Add"}
            </button>
         </div>
      </>
   );
};

export default ActionForm;

import React from "react";

const RunButtonComponent = ({ currentRunning, workflowHandler, disable = false }) => {
   return (
      <div className="btn-run mx-3">
         {currentRunning ? (
            <i className="fas fa-spinner fa-spin " />
         ) : (
            <i
               type="button"
               className={`fad fa-play-circle ${disable ? "disabled" : ""}`}
               title="Run"
               onClick={(e) => {
                  e.stopPropagation();
                  workflowHandler();
               }}
            />
         )}
      </div>
   );
};

export default RunButtonComponent;

import React from "react";

const RunButtonComponent = ({ currentRunning, workflowHandler, disable = false }) => {
   return (
      <div className="mx-3 text-primary">
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

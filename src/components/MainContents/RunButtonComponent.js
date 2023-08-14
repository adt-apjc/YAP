import React from "react";

const RunButtonComponent = (props) => {
   return (
      <div className="mx-3 text-primary">
         {props.currentRunning ? (
            <i className="fas fa-spinner fa-spin " />
         ) : (
            <i
               type="button"
               className="fad fa-play-circle "
               title="Run"
               onClick={(e) => {
                  e.stopPropagation();
                  props.workflowHandler();
               }}
            />
         )}
      </div>
   );
};

export default RunButtonComponent;

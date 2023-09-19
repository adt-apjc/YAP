type RunButtonComponentProps = {
   currentRunning: boolean;
   workflowHandler: () => void;
   disable: boolean;
};

const RunButtonComponent = ({ currentRunning, workflowHandler, disable = false }: RunButtonComponentProps) => {
   return (
      <div className="btn-run mx-3">
         {currentRunning ? (
            <i className="fas fa-spinner fa-spin " />
         ) : (
            <i
               className={`fad fa-play-circle pointer ${disable ? "disabled" : ""}`}
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

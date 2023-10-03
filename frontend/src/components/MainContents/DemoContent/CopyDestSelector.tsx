import { useGlobalContext } from "../../contexts/ContextProvider";

type CopyDestSelectorProps = { source: "outcome" | "action"; close: () => void; onItemClick: (item: string) => void };

export const CopyDestSelector = (props: CopyDestSelectorProps) => {
   const { context } = useGlobalContext();
   const handleSelectDest = (item: string) => {
      props.onItemClick(item);
      props.close();
   };

   return (
      <div className="p-2">
         <div className="fw-light mb-2">Copy</div>
         {props.source === "action" && (
            <>
               <div className="fw-light font-sm">to current step</div>
               <div className="d-flex btn-group mb-2">
                  <button className="btn btn-outline-secondary btn-sm" onClick={() => handleSelectDest("preCheck")}>
                     Pre-Check
                  </button>
                  <button className="btn btn-outline-secondary btn-sm" onClick={() => handleSelectDest("actions")}>
                     Action
                  </button>
                  <button className="btn btn-outline-secondary btn-sm" onClick={() => handleSelectDest("postCheck")}>
                     Post-Check
                  </button>
               </div>
               <div className="fw-light font-sm">to staging step</div>
               <div className="d-flex btn-group mb-2">
                  <button className="btn btn-outline-secondary btn-sm" onClick={() => handleSelectDest("stage")}>
                     Stage
                  </button>
                  <button className="btn btn-outline-secondary btn-sm" onClick={() => handleSelectDest("cleanup")}>
                     Clean Up
                  </button>
                  <button className="btn btn-outline-secondary btn-sm" onClick={() => handleSelectDest("unstage")}>
                     Unstage
                  </button>
               </div>
            </>
         )}
         <div className="fw-light font-sm">{props.source === "outcome" ? "Select destination" : "other"}</div>
         <ul className="list-group">
            {context.config.sidebar
               .filter((s) => s.name !== context.currentStep.name)
               .map((el) => (
                  <button
                     key={el.name}
                     className="list-group-item list-group-item-action"
                     onClick={() => handleSelectDest(el.name)}
                  >
                     {el.label}
                  </button>
               ))}
         </ul>
      </div>
   );
};

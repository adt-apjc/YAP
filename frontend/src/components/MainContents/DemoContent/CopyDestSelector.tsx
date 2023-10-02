import { useGlobalContext } from "../../contexts/ContextProvider";

type CopyDestSelectorProps = { close: () => void; onItemClick: (item: { name: string; label: string }) => void };

export const CopyDestSelector = (props: CopyDestSelectorProps) => {
   const { context } = useGlobalContext();
   let spacialStep = [
      { name: "stage", label: "Stage" },
      { name: "cleanup", label: "Clean Up" },
      { name: "unstage", label: "Unstage" },
   ];
   let sameStep = [
      { name: "preCheck", label: "Pre-Check" },
      { name: "action", label: "Action" },
      { name: "postCheck", label: "Post-Check" },
   ];
   return (
      <div className="p-2">
         <div className="fw-light mb-1">Copy to</div>
         <ul className="list-group">
            {[...sameStep, ...context.config.sidebar, ...spacialStep].map((el) => (
               <button
                  key={el.name}
                  className="list-group-item list-group-item-sm list-group-item-action"
                  onClick={() => {
                     props.onItemClick(el);
                     props.close();
                  }}
               >
                  {el.label}
               </button>
            ))}
         </ul>
      </div>
   );
};

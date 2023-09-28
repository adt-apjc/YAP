import { useGlobalContext } from "../../contexts/ContextProvider";

type CopyDestSelectorProps = { close: () => void; onItemClick: (item: { name: string; label: string }) => void };

export const CopyDestSelector = (props: CopyDestSelectorProps) => {
   const { context } = useGlobalContext();

   return (
      <div className="p-2">
         <div className="fw-light mb-1">Copy to</div>
         <ul className="list-group">
            {context.config.sidebar.map((el) => (
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

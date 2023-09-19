import { useState, useRef } from "react";
import WithDropdown from "../../Popper/Dropdown";
import { useGlobalContext } from "../../contexts/ContextProvider";
import { saveAs } from "file-saver";

const ActionTooltipContent = ({ setIsOpen }: { setIsOpen: React.Dispatch<React.SetStateAction<boolean>> }) => {
   const { context, dispatch } = useGlobalContext();
   const importRef = useRef<HTMLInputElement | null>(null);

   const exportProjectHandler = () => {
      console.log("export:", context.config);
      let blob = new Blob([JSON.stringify(context.config, null, 2)], { type: "text/plain;charset=utf-8" });
      saveAs(blob, `${context.config.title || "project"}.json`);
      setIsOpen(false);
   };

   const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      event.stopPropagation();

      let file = event.target.files![0];
      console.log(file);
      if (file) {
         const reader = new FileReader();
         // define callback
         reader.onabort = () => console.log("file reading was aborted");
         reader.onerror = () => console.log("file reading has failed");
         reader.onloadend = () => {
            const contentString = reader.result;
            try {
               const config = JSON.parse(contentString as string);
               console.log("DEBUG", config);
               // load config context
               dispatch({ type: "loadConfig", payload: config });
               importRef.current!.value = "";
               setIsOpen(false);
            } catch (e) {
               console.log(e);
               importRef.current!.value = "";
            }
         };
         // read file content
         reader.readAsText(file);
      }
   };

   return (
      <div className="text-dark px-2 py-1" style={{ minWidth: "10rem" }}>
         <div
            className="custom-dropdown"
            onClick={() => {
               dispatch({ type: "setCurrentStep", payload: { name: "stage", label: "Stage Demo" } });
            }}
         >
            <i className="pointer fal fa-wrench me-1" />
            Stage
         </div>
         <div
            className="custom-dropdown"
            onClick={() => {
               dispatch({ type: "setCurrentStep", payload: { name: "cleanup", label: "Reset Demo" } });
            }}
         >
            <i className="pointer fal fa-redo me-1" />
            Clean Up
         </div>
         <div
            className="custom-dropdown"
            onClick={() => {
               dispatch({ type: "setCurrentStep", payload: { name: "unstage", label: "Unstage Demo" } });
            }}
         >
            <i className="pointer fal fa-recycle me-1" />
            Unstage
         </div>
         {context.mode === "edit" && (
            <>
               <hr className="mx-0 my-2" />
               <div
                  className="custom-dropdown"
                  onClick={() => {
                     dispatch({ type: "clearConfig" });
                     setIsOpen(false);
                  }}
               >
                  <i className="pointer fal fa-eraser me-2" />
                  Reset
               </div>
               <div
                  className="custom-dropdown"
                  onClick={() => {
                     dispatch({ type: "newConfig" });
                     setIsOpen(false);
                  }}
               >
                  <i className="pointer fal fa-file me-2" />
                  New
               </div>
               <div
                  className="custom-dropdown"
                  onClick={() => {
                     importRef.current!.click();
                  }}
               >
                  <i className="pointer fal fa-file-import me-2" />
                  Import
                  <input
                     id="importFile"
                     type="file"
                     accept="application/json"
                     ref={importRef}
                     style={{ display: "none" }}
                     onChange={onFileChange}
                  />
               </div>
               <div className="custom-dropdown" onClick={exportProjectHandler}>
                  <i className="pointer fal fa-download me-2" />
                  Export
               </div>
            </>
         )}
      </div>
   );
};

const Actions = () => {
   const [isOpen, setIsOpen] = useState(false);

   return (
      <WithDropdown
         placement="left-start"
         interactive
         offset={[35, -35]}
         open={isOpen}
         onRequestClose={() => setIsOpen(false)}
         DropdownComponent={<ActionTooltipContent setIsOpen={setIsOpen} />}
      >
         <div title="actions" className="nav-action me-2" onClick={() => setIsOpen(true)}>
            <i className="fal fa-ellipsis-h-alt" />
         </div>
      </WithDropdown>
   );
};

export default Actions;
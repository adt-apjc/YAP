import React, { useState, useRef } from "react";
import WithDropdown from "../../Popper/Dropdown";
import _ from "lodash";
import { useGlobalContext } from "../../contexts/ContextProvider";
import { saveAs } from "file-saver";

const ActionTooltipContent = ({ setIsOpen }) => {
   const { context, dispatch } = useGlobalContext();
   const importRef = useRef();

   const exportProjectHandler = () => {
      console.log("export:", context.config);
      let blob = new Blob([JSON.stringify(context.config, null, 2)], { type: "text/plain;charset=utf-8" });
      saveAs(blob, `${context.config.title || "project"}.json`);
      setIsOpen(false);
   };

   const onFileChange = (event) => {
      event.stopPropagation();
      let file = event.target.files[0];
      console.log(file);
      if (file) {
         const reader = new FileReader();
         // define callback
         reader.onabort = () => console.log("file reading was aborted");
         reader.onerror = () => console.log("file reading has failed");
         reader.onloadend = () => {
            const contentString = reader.result;
            try {
               const config = JSON.parse(contentString);
               console.log("DEBUG", config);
               // load config context
               dispatch({ type: "loadConfig", payload: config });
               importRef.current.value = "";
               setIsOpen(false);
            } catch (e) {
               console.log(e);
               importRef.current.value = "";
            }
         };
         // read file content
         reader.readAsText(file);
      }
   };

   return (
      <div className="text-dark px-2 py-1" style={{ minWidth: "10rem" }}>
         <div className="custom-dropdown" onClick={() => {}}>
            <i type="button" className="fal fa-broom me-1" />
            Stage (TBA)
         </div>
         <div
            className="custom-dropdown"
            onClick={() => {
               if (_.isEmpty(context.config.mainContent.cleanup)) {
                  dispatch({ type: "clearStateHandler" });
               } else {
                  dispatch({ type: "setCurrentStep", payload: { name: "cleanup", label: "Reset Demo" } });
               }
            }}
         >
            <i type="button" className="fal fa-broom me-1" />
            Clean Up
         </div>
         <div className="custom-dropdown" onClick={() => {}}>
            <i type="button" className="fal fa-broom me-1" />
            Unstage (TBA)
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
                  <i type="button" className="fal fa-eraser me-2" />
                  Reset
               </div>
               <div className="custom-dropdown" onClick={() => {}}>
                  <i type="button" className="fal fa-eraser me-2" />
                  New (TBA)
               </div>
               <div
                  className="custom-dropdown"
                  onClick={() => {
                     importRef.current.click();
                  }}
               >
                  <i type="button" className="fal fa-file-import me-2" />
                  Import
                  <input id="importFile" type="file" ref={importRef} style={{ display: "none" }} onChange={onFileChange} />
               </div>
               <div className="custom-dropdown" onClick={exportProjectHandler}>
                  <i type="button" className="fal fa-download me-2" />
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

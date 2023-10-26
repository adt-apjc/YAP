import { useRef, useState } from "react";
import { saveAs } from "file-saver";
import axios from "axios";

import { useGlobalContext } from "../../contexts/ContextProvider";
import WithDropdown from "../../Popper/Dropdown";
import ModalContentSelector from "../ModalContentSelector";
import { Modal } from "../../../helper/modalHelper";

const ActionTooltipContent = ({
   close,
   setModalShow,
}: {
   close: () => void;
   setModalShow: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
   const { context, dispatch } = useGlobalContext();
   const [isPDFLoading, setIsPDFLoading] = useState(false);
   const importRef = useRef<HTMLInputElement | null>(null);

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
               close();
            } catch (e) {
               console.log(e);
               importRef.current!.value = "";
            }
         };
         // read file content
         reader.readAsText(file);
      }
   };

   const handleGeneratePDF = async (e: React.MouseEvent) => {
      e.preventDefault();
      setIsPDFLoading(true);
      let pdfBinaryData = await axios.post(`${process.env.REACT_APP_API_URL!.replace(/\/+$/, "")}/generate/pdf`, context.config, {
         responseType: "blob",
      });
      let blob = new Blob([pdfBinaryData.data], { type: "application/pdf" });
      saveAs(blob, "presentation.pdf");
      setIsPDFLoading(false);
      close();
   };

   return (
      <div className="text-dark px-2 py-1" style={{ minWidth: "10rem" }}>
         <div
            className="custom-dropdown"
            onClick={() => {
               dispatch({ type: "setCurrentStep", payload: { name: "stage", label: "Stage Demo" } });
               close();
            }}
         >
            <i style={{ width: 14 }} className="pointer fal fa-wrench me-1" />
            Stage
         </div>
         <div
            className="custom-dropdown"
            onClick={() => {
               dispatch({ type: "setCurrentStep", payload: { name: "cleanup", label: "Reset Demo" } });
               close();
            }}
         >
            <i style={{ width: 14 }} className="pointer fal fa-redo me-1" />
            Clean Up
         </div>
         <div
            className="custom-dropdown"
            onClick={() => {
               dispatch({ type: "setCurrentStep", payload: { name: "unstage", label: "Unstage Demo" } });
               close();
            }}
         >
            <i style={{ width: 14 }} className="pointer fal fa-recycle me-1" />
            Unstage
         </div>
         {context.mode === "edit" && (
            <>
               <hr className="mx-0 my-2" />
               <div
                  className="custom-dropdown"
                  onClick={() => {
                     dispatch({ type: "clearConfig" });
                     close();
                  }}
               >
                  <i style={{ width: 14 }} className="pointer fal fa-eraser me-2" />
                  Reset
               </div>
               <div
                  className="custom-dropdown"
                  onClick={() => {
                     dispatch({ type: "newConfig" });
                     close();
                  }}
               >
                  <i style={{ width: 14 }} className="pointer fal fa-file me-2" />
                  New
               </div>
               <div className="custom-dropdown" onClick={() => importRef.current?.click()}>
                  <i style={{ width: 14 }} className="pointer fal fa-file-import me-2" />
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
               <div
                  className="custom-dropdown"
                  onClick={() => {
                     setModalShow(true);
                     close();
                  }}
               >
                  <i style={{ width: 14 }} className="pointer fal fa-download me-2" />
                  Export
               </div>
               <div className="custom-dropdown" onClick={handleGeneratePDF}>
                  <i style={{ width: 14 }} className="pointer fal fa-file-pdf me-2" />
                  {isPDFLoading ? "Generating... " : "Export as PDF"}
                  {isPDFLoading && <i className="fal fa-spinner fa-spin ms-2" />}
               </div>
            </>
         )}
      </div>
   );
};

const Actions = () => {
   const [modalShow, setModalShow] = useState(false);

   return (
      <>
         <WithDropdown
            className="d-none d-sm-block"
            placement="left-start"
            interactive
            offset={[35, -35]}
            DropdownComponent={(close) => <ActionTooltipContent close={close} setModalShow={setModalShow} />}
         >
            <div title="actions" className="nav-action me-2">
               <i className="fal fa-ellipsis-h-alt" />
            </div>
         </WithDropdown>
         <Modal show={modalShow} onHide={() => setModalShow(false)}>
            <ModalContentSelector contentType="export" onHide={() => setModalShow(false)} />
         </Modal>
      </>
   );
};

export default Actions;

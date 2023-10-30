import { useState } from "react";
import { saveAs } from "file-saver";
import axios from "axios";

import { useGlobalContext } from "../../contexts/ContextProvider";
import WithDropdown from "../../Popper/Dropdown";
import ModalContentSelector from "../ModalContentSelector";
import { Modal } from "../../../helper/modalHelper";

const ActionTooltipContent = ({ close }: { close: () => void; setModalShow: React.Dispatch<React.SetStateAction<boolean>> }) => {
   const { context, dispatch } = useGlobalContext();
   const [isPDFLoading, setIsPDFLoading] = useState(false);

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
         <div className="custom-dropdown" onClick={handleGeneratePDF}>
            <i style={{ width: 14 }} className="pointer fal fa-file-pdf me-2" />
            {isPDFLoading ? "Generating... " : "Export as PDF"}
            {isPDFLoading && <i className="fal fa-spinner fa-spin ms-2" />}
         </div>
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

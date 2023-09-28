import React, { useState } from "react";
import WithDropdown from "../../Popper/Dropdown";
import { useGlobalContext } from "../../contexts/ContextProvider";
import ModalContentSelector from "../ModalContentSelector";
import { Modal } from "../../../helper/modalHelper";

type SettingsTooltipContentProps = {
   close: () => void;
   setModalShow: React.Dispatch<React.SetStateAction<boolean>>;
};

const SettingsTooltipContent = ({ close, setModalShow }: SettingsTooltipContentProps) => {
   const { context, dispatch } = useGlobalContext();

   return (
      <div className="text-dark px-2 py-1" style={{ minWidth: "10rem" }}>
         <div
            className="custom-dropdown"
            onClick={() => {
               dispatch({ type: "toggleMode" });
               close();
            }}
         >
            Switch to <span className="text-primary">{context.mode === "presentation" ? "Edit" : "Presentation"} mode</span>
         </div>
         <div
            className="custom-dropdown"
            onClick={() => {
               setModalShow(true);
               close();
            }}
         >
            Settings
         </div>
      </div>
   );
};

const Settings = () => {
   const [modalShow, setModalShow] = useState(false);

   return (
      <>
         <WithDropdown
            className="d-none d-sm-block"
            placement="left-start"
            interactive
            offset={[35, -35]}
            DropdownComponent={(close) => <SettingsTooltipContent close={close} setModalShow={setModalShow} />}
         >
            <div title="settings" className="nav-action">
               <i className="fal fa-cog " />
            </div>
         </WithDropdown>
         <Modal show={modalShow} onHide={() => setModalShow(false)}>
            <ModalContentSelector contentType="settings" onHide={() => setModalShow(false)} />
         </Modal>
      </>
   );
};

export default Settings;

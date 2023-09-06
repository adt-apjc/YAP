import React, { useState } from "react";
import WithDropdown from "../Popper/Dropdown";
import { useGlobalContext } from "../contexts/ContextProvider";
import ModalContentSelector from "../Sidebar/ModalContentSelector";
import { Modal } from "../../helper/modalHelper";

const SettingsTooltipContent = ({ setIsOpen, setModalShow }) => {
   const { context, dispatch } = useGlobalContext();

   return (
      <div className="text-dark px-2 py-1" style={{ minWidth: "10rem" }}>
         <div
            className="custom-dropdown"
            onClick={() => {
               dispatch({ type: "toggleMode" });
               setIsOpen(false);
            }}
         >
            Switch to <span className="text-primary">{context.mode === "presentation" ? "Edit" : "Presentation"} mode</span>
         </div>
         <div
            className="custom-dropdown"
            onClick={() => {
               dispatch({ type: "clearConfig" });
               setIsOpen(false);
            }}
         >
            Clear Configuration
         </div>
         <div
            className="custom-dropdown"
            onClick={() => {
               setModalShow(true);
               setIsOpen(false);
            }}
         >
            Settings
         </div>
      </div>
   );
};

const Settings = () => {
   const [isOpen, setIsOpen] = useState(false);
   const [modalShow, setModalShow] = useState(false);

   return (
      <>
         <WithDropdown
            placement="left-start"
            interactive
            offset={[35, -35]}
            open={isOpen}
            onRequestClose={() => setIsOpen(false)}
            DropdownComponent={<SettingsTooltipContent setIsOpen={setIsOpen} setModalShow={setModalShow} />}
         >
            <div title="settings" className="nav-action" onClick={() => setIsOpen(true)}>
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

import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import WithDropdown from "../../Popper/Dropdown";
import { useGlobalContext } from "../../contexts/ContextProvider";
import ModalContentSelector from "../ModalContentSelector";
import { Modal } from "../../../helper/modalHelper";

type SettingsTooltipContentProps = {
   close: () => void;
   setModalShow: React.Dispatch<React.SetStateAction<boolean>>;
   setModalType: React.Dispatch<React.SetStateAction<string>>;
};

const SettingsTooltipContent = ({ close, setModalShow, setModalType }: SettingsTooltipContentProps) => {
   const { context, dispatch } = useGlobalContext();
   const importRef = useRef<HTMLInputElement | null>(null);
   const navigate = useNavigate();

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

   return (
      <div className="text-dark px-2 py-1" style={{ minWidth: "10rem" }}>
         <div
            className="custom-dropdown"
            onClick={() => {
               dispatch({ type: "toggleMode" });
               close();
            }}
         >
            <i
               style={{ width: 14 }}
               className={context.mode === "presentation" ? "pointer fal fa-edit me-2" : "pointer fal fa-presentation me-2"}
            />
            Switch to <span className="text-primary">{context.mode === "presentation" ? "Edit" : "Presentation"} mode</span>
         </div>
         <div
            className="custom-dropdown"
            onClick={() => {
               setModalShow(true);
               setModalType("settings");
               close();
            }}
         >
            <i style={{ width: 14 }} className="pointer fal fa-cog me-2" />
            Settings
         </div>

         <hr className="mx-0 my-2" />
         <div
            className="custom-dropdown"
            onClick={() => {
               dispatch({ type: "clearConfig" });
               close();
               navigate("/");
            }}
         >
            <i style={{ width: 14 }} className="pointer fal fa-eraser me-2" />
            Reset to catalog
         </div>
         {context.mode === "edit" && (
            <>
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
                     setModalType("export");
                     close();
                  }}
               >
                  <i style={{ width: 14 }} className="pointer fal fa-download me-2" />
                  Export
               </div>
            </>
         )}
      </div>
   );
};

const Settings = () => {
   const [modalShow, setModalShow] = useState(false);
   const [modalType, setModalType] = useState("");

   return (
      <>
         <WithDropdown
            className="d-none d-sm-block"
            placement="left-start"
            interactive
            offset={[35, -35]}
            DropdownComponent={(close) => (
               <SettingsTooltipContent close={close} setModalShow={setModalShow} setModalType={setModalType} />
            )}
         >
            <div title="settings" className="nav-action">
               <i className="fal fa-cog " />
            </div>
         </WithDropdown>
         <Modal show={modalShow} onHide={() => setModalShow(false)}>
            <ModalContentSelector
               contentType={modalType === "settings" ? "settings" : "export"}
               onHide={() => setModalShow(false)}
            />
         </Modal>
      </>
   );
};

export default Settings;

import React, { useState, useEffect, useRef } from "react";
import { Modal } from "../../../helper/modalHelper";
import { Popper } from "../../../helper/popperHelper";
import ModalContentSelector from "../ModalContentSelector";
import { useGlobalContext } from "../../contexts/ContextProvider";

const MoreOption = (props) => {
   const [popupShow, setPopupShow] = useState(false);
   const [modalShow, setModalShow] = useState(false);
   const triggerRef = useRef();
   const warpperRef = useRef();

   const { context, dispatch } = useGlobalContext();

   const togglePopupShow = () => {
      setPopupShow((prev) => !prev);
   };

   useEffect(() => {
      const handleClickOutside = (event) => {
         if (warpperRef && !warpperRef.current.contains(event.target)) {
            setPopupShow(false);
         }
      };
      console.log("add event");
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
         console.log("remove event");
         document.removeEventListener("mousedown", handleClickOutside);
      };
   }, []);

   return (
      <div ref={warpperRef} className="collapse-icon text-light pointer">
         <span ref={triggerRef} onClick={togglePopupShow}>
            More
         </span>
         <Popper show={popupShow} triggerRef={triggerRef}>
            <div className="list-group">
               <button
                  className="list-group-item list-group-item-action"
                  onClick={() => {
                     dispatch({ type: "toggleMode" });
                     setPopupShow(false);
                  }}
               >
                  Switch to <span className="text-info">{context.mode === "presentation" ? "Edit" : "Presentation"} mode</span>
               </button>
               <button
                  className="list-group-item list-group-item-action"
                  onClick={() => {
                     dispatch({ type: "clearConfig" });
                     setPopupShow(false);
                  }}
               >
                  Clear Configuration
               </button>
               <button
                  className="list-group-item list-group-item-action"
                  onClick={() => {
                     setModalShow(true);
                     setPopupShow(false);
                  }}
               >
                  Settings
               </button>
            </div>
         </Popper>
         <Modal show={modalShow} onHide={() => setModalShow(false)}>
            <ModalContentSelector contentType="settings" onHide={() => setModalShow(false)} />
         </Modal>
      </div>
   );
};

export default MoreOption;

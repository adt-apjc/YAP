import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { usePopper } from "react-popper";

const DropdownElement = React.forwardRef((props, ref) => {
   const selfRef = useRef(null);
   const { onRequestClose, interactive } = props;

   useEffect(() => {
      const handleClickOutside = (event) => {
         if (!interactive || (selfRef.current && !selfRef.current.contains(event.target))) {
            onRequestClose && onRequestClose();
         }
      };

      document.addEventListener("click", handleClickOutside, true);
      return () => {
         document.removeEventListener("click", handleClickOutside, true);
      };
   }, [onRequestClose, interactive]);

   if (props.bindToRoot) {
      return createPortal(
         <div ref={selfRef}>
            <div
               ref={ref}
               className="dropdown-container border rounded bg-white shadow"
               style={{ ...props.styles.popper }}
               {...props.attributes.popper}
            >
               {props.children}
            </div>
         </div>,
         document.getElementById("root"),
      );
   } else {
      return (
         <div ref={selfRef}>
            <div
               ref={ref}
               className="dropdown-container border rounded bg-white shadow"
               style={{ ...props.styles.popper }}
               {...props.attributes.popper}
            >
               {props.children}
            </div>
         </div>
      );
   }
});

const WithDropdown = (props) => {
   const [showDropdown, setShowDropdown] = useState(false);
   const [referenceElement, setReferenceElement] = useState(null);
   const [popperElement, setPopperElement] = useState(null);
   const [arrowElement, setArrowElement] = useState(null);

   const { styles, attributes } = usePopper(referenceElement, popperElement, {
      placement: props.placement || "bottom",
      modifiers: [
         { name: "offset", options: { offset: props.offset || [0, 8] } },
         {
            name: "arrow",
            options: { element: arrowElement },
         },
      ],
   });

   useEffect(() => {
      setShowDropdown(() => props.open);
   }, [props.open]);

   return (
      <>
         <span
            ref={setReferenceElement}
            role="button"
            className={props.className}
            style={props.style}
            onClick={() => {
               if (props.open === undefined) setShowDropdown(true);
            }}
         >
            {props.children}
         </span>
         {showDropdown && (
            <DropdownElement
               ref={setPopperElement}
               styles={styles}
               attributes={attributes}
               interactive={props.interactive}
               bindToRoot={props.bindToRoot}
               onRequestClose={() => {
                  if (typeof props.onRequestClose === "function") props.onRequestClose();
                  else setShowDropdown(false);
               }}
            >
               {props.DropdownComponent}
               {props.showArrow && <div className="popper-arrow" ref={setArrowElement} style={styles.arrow} />}
            </DropdownElement>
         )}
      </>
   );
};

export default WithDropdown;

import React, { useState } from "react";
import { usePopper } from "react-popper";

const PopperElement = React.forwardRef((props, ref) => {
   return (
      <div
         className="info-popper border rounded bg-white shadow-sm"
         ref={ref}
         style={{ ...props.styles.popper }}
         {...props.attributes.popper}
      >
         {props.children}
      </div>
   );
});

const WithInfoPopup = (props) => {
   const [showPopper, setShowPopper] = useState(false);
   const [referenceElement, setReferenceElement] = useState(null);
   const [popperElement, setPopperElement] = useState(null);

   const { styles, attributes } = usePopper(referenceElement, popperElement, {
      placement: props.placement ? props.placement : "bottom",
      modifiers: [{ name: "offset", options: { offset: [0, 8] } }],
   });

   return (
      <>
         <span
            ref={setReferenceElement}
            role="button"
            className={props.className}
            style={props.style}
            onMouseEnter={() => setShowPopper(true)}
            onMouseLeave={() => setShowPopper(false)}
         >
            {props.children}
         </span>
         {showPopper && (
            <PopperElement ref={setPopperElement} styles={styles} attributes={attributes}>
               {props.PopperComponent}
            </PopperElement>
         )}
      </>
   );
};

export default WithInfoPopup;

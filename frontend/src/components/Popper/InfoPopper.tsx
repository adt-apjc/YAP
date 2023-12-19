import React, { useState } from "react";
import { usePopper } from "react-popper";
import type { Placement } from "@popperjs/core";

type PopperElementProps = {
   styles: { [key: string]: React.CSSProperties };
   attributes: any;
   children: React.ReactNode;
};

const PopperElement = React.forwardRef((props: PopperElementProps, ref) => {
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

type WithInfoPopupProps = {
   placement: Placement;
   PopperComponent: React.ReactNode;
   children: React.ReactNode;
   className?: string;
   style?: React.CSSProperties;
   enable?: boolean;
};

const WithInfoPopup = (props: WithInfoPopupProps) => {
   const [showPopper, setShowPopper] = useState(false);
   const [referenceElement, setReferenceElement] = useState<HTMLSpanElement | null>(null);
   const [popperElement, setPopperElement] = useState<HTMLElement | null>(null);

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
         {(props.enable === undefined || props.enable === true) && showPopper && (
            <PopperElement ref={setPopperElement} styles={styles} attributes={attributes}>
               {props.PopperComponent}
            </PopperElement>
         )}
      </>
   );
};

export default WithInfoPopup;

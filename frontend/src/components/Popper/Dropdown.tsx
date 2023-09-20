import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { usePopper } from "react-popper";
import type { Placement } from "@popperjs/core";

type DropdownElementProps = {
   styles: { [key: string]: React.CSSProperties };
   attributes: any;
   children: React.ReactNode;
   interactive?: boolean;
   bindToRoot?: boolean;
   onRequestClose: () => any;
};

const DropdownElement = React.forwardRef((props: DropdownElementProps, ref) => {
   const selfRef = useRef<HTMLDivElement | null>(null);
   const { onRequestClose, interactive } = props;

   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (!interactive || (selfRef.current && !selfRef.current.contains(event.target as Node))) {
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
         document.getElementById("root")!
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

type WithDropdownProps = {
   DropdownComponent: React.ReactNode;
   children: React.ReactNode;
   open?: boolean;
   className?: string;
   style?: React.CSSProperties;
   placement?: Placement;
   offset?: [number, number];
   showArrow?: boolean;
   interactive?: boolean;
   bindToRoot?: boolean;
   onRequestClose?: () => any;
};

const WithDropdown = (props: WithDropdownProps) => {
   const [showDropdown, setShowDropdown] = useState(false);
   const [referenceElement, setReferenceElement] = useState<HTMLSpanElement | null>(null);
   const [popperElement, setPopperElement] = useState<HTMLElement | null>(null);
   const [arrowElement, setArrowElement] = useState<HTMLElement | null>(null);

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
      if (props.open !== undefined) setShowDropdown(props.open);
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

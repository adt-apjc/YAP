import ReactDOM from "react-dom";

type ModalProps = {
   show: boolean;
   children: React.ReactNode;
   enableBackdropClose?: boolean;
   width?: string;
   onHide: () => void;
};

export const Modal = (props: ModalProps) => {
   if (props.show) {
      return ReactDOM.createPortal(
         <div className="modal" style={{ display: "block" }} onClick={() => (props.enableBackdropClose ? props.onHide() : null)}>
            <div
               className="modal-dialog h-100 mw-100"
               onClick={(e) => e.stopPropagation()}
               style={{ width: `${props.width || "50%"}` }}
            >
               <div className="modal-content">{props.children}</div>
            </div>
         </div>,
         document.body
      );
   } else {
      return null;
   }
};

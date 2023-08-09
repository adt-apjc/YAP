import React from "react";
import ReactDOM from "react-dom";

export class Modal extends React.Component {
   render() {
      if (this.props.show) {
         return ReactDOM.createPortal(
            <div className="modal" style={{ display: "block" }} onClick={() => (this.props.enableBackdropClose ? this.props.onHide() : null)}>
               <div className="modal-dialog h-100 mw-100" onClick={(e) => e.stopPropagation()} style={{ width: `${this.props.width || "50%"}` }}>
                  <div className="modal-content">{this.props.children}</div>
               </div>
            </div>,
            document.body,
         );
      } else {
         return null;
      }
   }
}

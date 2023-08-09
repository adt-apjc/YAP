import React from "react";
import { Modal } from "../../helper/modalHelper";
import { Popper } from "../../helper/popperHelper";
import ModalContentSelector from "./ModalContentSelector";
import GlobalContext from "../contexts/ContextProvider";

class MoreOption extends React.Component {
   constructor(props) {
      super(props);
      this.state = { popupShow: false, modalShow: false };
      this.triggerRef = React.createRef();
      this.warpperRef = React.createRef();
   }

   componentDidMount() {
      document.addEventListener("mousedown", this.handleClickOutside);
   }

   componentWillUnmount() {
      document.removeEventListener("mousedown", this.handleClickOutside);
   }

   togglePopupShow = () => {
      this.setState({ popupShow: !this.state.popupShow });
      // console.log(this.warpperRef.current);
   };

   handleClickOutside = (event) => {
      if (this.warpperRef && !this.warpperRef.current.contains(event.target)) {
         this.setState({ popupShow: false });
         // console.log(this.warpperRef.current);
         // console.log(event.target);
      }
   };

   render() {
      const Context = this.context;
      return (
         <div ref={this.warpperRef} className="collapse-icon text-light pointer">
            <span ref={this.triggerRef} onClick={this.togglePopupShow}>
               More
            </span>
            <Popper show={this.state.popupShow} triggerRef={this.triggerRef}>
               <div className="list-group">
                  <button
                     className="list-group-item list-group-item-action"
                     onClick={() => {
                        Context.toggleMode();
                        this.setState({ popupShow: false });
                     }}
                  >
                     Switch to <span className="text-info">{Context.mode === "presentation" ? "Edit" : "Presentation"} mode</span>
                  </button>
                  <button
                     className="list-group-item list-group-item-action"
                     onClick={() => {
                        Context.clearConfig();
                     }}
                  >
                     Clear Configuration
                  </button>
                  <button className="list-group-item list-group-item-action" onClick={() => this.setState({ modalShow: true, popupShow: false })}>
                     Settings
                  </button>
               </div>
            </Popper>
            <Modal show={this.state.modalShow} onHide={() => this.setState({ modalShow: false })}>
               <ModalContentSelector contentType="settings" onHide={() => this.setState({ modalShow: false })} />
            </Modal>
         </div>
      );
   }
}
MoreOption.contextType = GlobalContext;

export default MoreOption;

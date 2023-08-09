import React from "react";
import { createPopper } from "@popperjs/core";

export class Popper extends React.Component {
   constructor(props) {
      super(props);
      this.popupRef = React.createRef();
      this.state = { show: false };
   }

   componentDidUpdate() {
      this.popper.forceUpdate();
   }

   componentDidMount() {
      this.setState({ show: this.props.show || false });
      this.popper = createPopper(this.props.triggerRef.current, this.popupRef.current, {
         placement: this.props.placement || "top-start",
         strategy: this.props.strategy || "fixed",
         modifiers: [
            {
               name: "offset",
               options: {
                  offset: [0, 8],
               },
            },
            ...(this.props.modifiers || []),
         ],
      });
   }

   render() {
      return (
         <div className="popup__content" ref={this.popupRef}>
            {this.props.show && this.props.children}
         </div>
      );
   }
}

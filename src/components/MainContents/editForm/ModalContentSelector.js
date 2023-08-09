import React from "react";
import ActionForm from "./ActionForm";
import ActionDeleteConfirmation from "./ActionDeleteConfirmation";
import EditStepDescription from "./EditStepDescription";
import EditPreface from "./EditPreface";
import PrefaceDeleteConfirmation from "./PrefaceDeleteConfirmation";
import EditOutcome from "./EditOutcome";
class ModalContentSelector extends React.Component {
   render() {
      const { contentType } = this.props;
      if (contentType === "action") {
         return <ActionForm {...this.props} tab={"actions"} />;
      } else if (contentType === "validation") {
         return <ActionForm {...this.props} tab={"validations"} />;
      } else if (contentType === "actionDeleteConfirm") {
         return <ActionDeleteConfirmation {...this.props} />;
      } else if (contentType === "editStepDescription") {
         return <EditStepDescription {...this.props} />;
      } else if (contentType === "editPreface") {
         return <EditPreface {...this.props} />;
      } else if (contentType === "prefaceDeleteConfirm") {
         return <PrefaceDeleteConfirmation {...this.props} />;
      } else if (contentType === "editOutcome") {
         return <EditOutcome {...this.props} />;
      } else {
         return null;
      }
   }
}

export default ModalContentSelector;

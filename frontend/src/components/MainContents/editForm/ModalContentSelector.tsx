import ActionForm from "./ActionForm";
import ActionDeleteConfirmation from "./ActionDeleteConfirmation";
import EditStepDescription from "./EditStepDescription";
import EditPreface from "./EditPreface";
import PrefaceDeleteConfirmation from "./PrefaceDeleteConfirmation";
import EditOutcome from "./EditOutcome/EditOutcome";

type ModalContentSelectorProps = {
   onHide: () => void;
   contentType: string;
   initValue: any;
};

const ModalContentSelector = (props: ModalContentSelectorProps) => {
   const { contentType } = props;
   if (contentType === "preCheck") {
      return <ActionForm {...props} tab="preCheck" />;
   } else if (contentType === "action") {
      return <ActionForm {...props} tab="actions" />;
   } else if (contentType === "postCheck") {
      return <ActionForm {...props} tab="postCheck" />;
   } else if (contentType === "actionDeleteConfirm") {
      return <ActionDeleteConfirmation {...props} />;
   } else if (contentType === "editStepDescription") {
      return <EditStepDescription {...props} />;
   } else if (contentType === "editPreface") {
      return <EditPreface {...props} />;
   } else if (contentType === "prefaceDeleteConfirm") {
      return <PrefaceDeleteConfirmation {...props} />;
   } else if (contentType === "editOutcome") {
      return <EditOutcome {...props} />;
   } else {
      return null;
   }
};

export default ModalContentSelector;

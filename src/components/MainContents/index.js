import React from "react";
import GlobalContext from "../contexts/ContextProvider";
import Preface from "./Preface";
import DemoContent from "./DemoContent";

import _ from "lodash";

class MainContents extends React.Component {
   render() {
      const Context = this.context;
      const currentStepDetails =
         Context.currentStep.name === "cleanup"
            ? Context.config.mainContent.cleanup
            : Context.config.mainContent[Context.currentStep.name];
      return (
         <div className="container-fluid">
            <div className="container-fluid pb-3">
               {_.isEmpty(Context.currentStep) ? (
                  <Preface config={Context.config.preface} />
               ) : (
                  <DemoContent currentStep={Context.currentStep} currentStepDetails={currentStepDetails} />
               )}
            </div>
         </div>
      );
   }
}

MainContents.contextType = GlobalContext;

export default MainContents;

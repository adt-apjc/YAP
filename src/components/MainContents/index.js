import React from "react";
import { useGlobalContext } from "../contexts/ContextProvider";
import Preface from "./Preface/Preface";
import DemoContent from "./DemoContent/DemoContent";

import _ from "lodash";

const MainContents = () => {
   const { context } = useGlobalContext();
   const currentStepDetails =
      context.currentStep.name === "cleanup"
         ? context.config.mainContent.cleanup
         : context.config.mainContent[context.currentStep.name];

   return (
      <div className="container-fluid">
         <div className="container-fluid pb-3">
            {!context.currentStep.name ? (
               <Preface config={context.config.preface} />
            ) : (
               <DemoContent currentStep={context.currentStep} currentStepDetails={currentStepDetails} />
            )}
         </div>
      </div>
   );
};

export default MainContents;

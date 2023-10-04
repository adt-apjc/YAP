import { useGlobalContext } from "../contexts/ContextProvider";
import Preface from "./Preface/Preface";
import DemoContent from "./DemoContent/DemoContent";

type currentStep = {
   name: string;
   label: string;
};

const MainContents = () => {
   const { context } = useGlobalContext();
   const currentStepDetails =
      context.currentStep.name === "cleanup"
         ? context.config.mainContent.cleanup
         : context.config.mainContent[context.currentStep.name!];

   return (
      <div className="py-3 px-4">
         {!context.currentStep.name ? (
            <Preface config={context.config.preface} prefaceRef={0} />
         ) : (
            <DemoContent currentStep={context.currentStep as currentStep} currentStepDetails={currentStepDetails} />
         )}
      </div>
   );
};

export default MainContents;

import React, { useEffect, useState } from "react";
import Preface from "../MainContents/Preface/Preface";
import { useGlobalContext } from "../contexts/ContextProvider";
import _ from "lodash";

const Canvas = () => {
   const { context } = useGlobalContext();
   const [showCanvas, setShowCanvas] = useState(false);
   const [prefaceRef, setPrefaceRef] = useState(0);

   useEffect(() => {
      // console.log(context.config.mainContent[context.currentStep.name].prefaceRef);
      if (
         !context.config.mainContent[context.currentStep.name] ||
         !context.config.mainContent[context.currentStep.name].prefaceRef ||
         context.config.mainContent[context.currentStep.name].prefaceRef > Object.keys(context.config.preface).length
      )
         setPrefaceRef(0);
      else setPrefaceRef(context.config.mainContent[context.currentStep.name].prefaceRef);
   }, [context.currentStep]);

   if (_.isEmpty(context.currentStep)) return;

   return (
      <div className="canvas-container">
         {showCanvas ? (
            <div className={`canvas-window open`}>
               <div className="container-fluid m-5">
                  <Preface config={context.config.preface} prefaceRef={prefaceRef} />
               </div>
               <div
                  title="toggle preface"
                  type="button"
                  className={`toggle-canvas open`}
                  onClick={() => setShowCanvas(!showCanvas)}
               >
                  <i className={`far fa-arrow-to-left`} />
               </div>
            </div>
         ) : (
            <div title="toggle preface" type="button" className={`toggle-canvas`} onClick={() => setShowCanvas(!showCanvas)}>
               <i className={`far fa-arrow-to-right`} />
            </div>
         )}
      </div>
   );
};

export default Canvas;

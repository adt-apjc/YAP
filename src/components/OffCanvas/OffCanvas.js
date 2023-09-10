import React, { useEffect, useState } from "react";
import Preface from "../MainContents/Preface/Preface";
import { useGlobalContext } from "../contexts/ContextProvider";
import _ from "lodash";

const OffCanvas = (props) => {
   const { context } = useGlobalContext();
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
      <div className="d-flex" style={{ zIndex: "999" }}>
         <div className={`offcanvas-window ${props.showOffCanvas ? "open" : ""}`}>
            <div className="offcanvas-content">
               <div title="close" className="d-flex justify-content-end">
                  <i type="button" className="fal fa-times closeButton" onClick={() => props.setShowOffCanvas(false)} />
               </div>
               {props.showOffCanvas && <Preface config={context.config.preface} prefaceRef={prefaceRef} />}
            </div>
            <div
               className={`offcanvas-backdrop ${props.showOffCanvas ? "show" : ""}`}
               onClick={() => props.setShowOffCanvas(false)}
            ></div>
         </div>
      </div>
   );
};

export default OffCanvas;

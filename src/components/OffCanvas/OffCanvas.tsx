import Preface from "../MainContents/Preface/Preface";
import { useGlobalContext } from "../contexts/ContextProvider";

type OffCanvasProps = {
   showOffCanvas: boolean;
   setShowOffCanvas: React.Dispatch<React.SetStateAction<boolean>>;
};

const OffCanvas = (props: OffCanvasProps) => {
   const { context } = useGlobalContext();

   if (!context.currentStep.name) return;

   return (
      <div className="d-flex" style={{ zIndex: "999" }}>
         <div className={`offcanvas-window ${props.showOffCanvas ? "open" : ""}`}>
            <div className="offcanvas-content">
               <div title="close" className="d-flex justify-content-end">
                  <i className="fal fa-times closeButton pointer" onClick={() => props.setShowOffCanvas(false)} />
               </div>
               {props.showOffCanvas && (
                  <Preface
                     config={context.config.preface}
                     prefaceRef={context.config.mainContent[context.currentStep.name!].prefaceRef}
                  />
               )}
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

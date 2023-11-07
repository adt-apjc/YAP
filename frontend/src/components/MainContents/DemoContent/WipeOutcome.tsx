import { useGlobalContext } from "../../contexts/ContextProvider";
import _ from "lodash";

type WipeOutcomeProps = { close: () => void; currentStep: string };

const WipeOutcome = (props: WipeOutcomeProps) => {
   const { context, dispatch } = useGlobalContext();

   const wipeOutcomeHandler = () => {
      let currentConfig = _.cloneDeep(context.config);
      currentConfig.mainContent[props.currentStep].outcome = [{}];

      dispatch({ type: "replaceConfig", payload: currentConfig });
      props.close();
   };

   return (
      <div className="d-flex flex-column p-3 font-sm">
         <div>
            <span className="text-danger me-1">Warning: </span> All elements inside the outcome section will be wiped.
         </div>
         <div className="d-flex justify-content-end mt-3" role="group" aria-label="Small button group">
            <button type="button" className="btn btn-sm font-sm" onClick={() => props.close()}>
               Cancel
            </button>
            <button type="button" className="btn btn-sm btn-danger font-sm" onClick={wipeOutcomeHandler}>
               Confirm
            </button>
         </div>
      </div>
   );
};

export default WipeOutcome;

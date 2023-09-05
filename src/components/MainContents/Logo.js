import React, { useContext, useState } from "react";
import GlobalContext from "../contexts/ContextProvider";
import _ from "lodash";

const Logo = () => {
   const context = useContext(GlobalContext);
   const [state, setState] = useState({
      activeEditMainTitle: false,
      titleInput: "",
   });

   const editTitleNameHandler = () => {
      let currentConfig = _.cloneDeep(context.config);
      currentConfig.title = state.titleInput;
      context.updateConfig(currentConfig);
      setState((prev) => ({ ...prev, activeEditMainTitle: false }));
   };

   const isSomeStepRunning = () => {
      for (let i in context.runningStatus) {
         if (context.runningStatus[i] === "running") return true;
      }
      return false;
   };

   return (
      <div className="d-flex align-items-center">
         <img
            src={`${
               context.config.navbar && context.config.navbar.logoUrl
                  ? `${context.config.navbar.logoUrl}`
                  : `${process.env.PUBLIC_URL}/ciscologo-white.png`
            }`}
            alt="nav-logo"
            className="nav-logo"
         />
         {state.activeEditMainTitle ? (
            <input
               className="form-control form-control-sm"
               type="text"
               value={state.titleInput}
               onChange={(e) => setState((prev) => ({ ...prev, titleInput: e.target.value }))}
            />
         ) : (
            <div
               className={`nav-title  ${isSomeStepRunning() ? "disabled" : ""}`}
               onClick={() => context.setCurrentStep(context.config.preface ? {} : { ...context.config.sidebar[0] })}
            >
               {`${
                  context.config.navbar && context.config.navbar.title
                     ? `${context.config.navbar.title}`
                     : `${context.config.title}`
               }`}
            </div>
         )}
         {context.mode === "edit" && (
            <div style={{ fontSize: "12px" }} className={`${isSomeStepRunning() ? "disabled" : ""}`}>
               {state.activeEditMainTitle ? (
                  <div type="button" onClick={editTitleNameHandler}>
                     <i className="far fa-check ms-2" />
                  </div>
               ) : (
                  <div
                     title="edit"
                     type="button"
                     onClick={() =>
                        setState((prev) => ({ ...prev, activeEditMainTitle: true, titleInput: context.config.title }))
                     }
                  >
                     <i className="far fa-edit ms-2" />
                  </div>
               )}
            </div>
         )}
      </div>
   );
};

export default Logo;

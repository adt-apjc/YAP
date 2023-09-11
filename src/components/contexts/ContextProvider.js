import React, { useEffect, useReducer } from "react";
import config from "../../config/config.json";
import _ from "lodash";

const GlobalContext = React.createContext();

let initState = {
   currentStep: config.preface ? {} : { ...config.sidebar[0] },
   runningStatus: {},
   clearStateFunction: {},
   config: config,
   mode: "presentation",
};

function addAction(state, payload) {
   let clonedState = _.cloneDeep(state);
   if (payload.index !== null) {
      // this block is for edit
      clonedState.config.mainContent[payload.stepKey][payload.tab][payload.index] = payload.actionObject;
   } else {
      // this block is for add new action
      if (clonedState.config.mainContent[payload.stepKey][payload.tab]) {
         clonedState.config.mainContent[payload.stepKey][payload.tab].push(payload.actionObject);
      } else {
         clonedState.config.mainContent[payload.stepKey][payload.tab] = [payload.actionObject];
      }
   }
   console.log(clonedState.config.mainContent[payload.stepKey][payload.tab]);
   return clonedState;
}

function deleteAction(state, payload) {
   let clonedState = _.cloneDeep(state);
   state.config.mainContent[payload.stepKey][payload.tab].splice(payload.index, 1);
   return clonedState;
}

function addStep(state, payload) {
   let clonedState = _.cloneDeep(state);
   let newStepName = `Step_${clonedState.config.sidebar.length + 1}`;
   clonedState.config.sidebar.push({ name: newStepName, label: payload.name });
   clonedState.config.mainContent[newStepName] = { preCheck: [], actions: [], postCheck: [], outcome: [{}] };
   return clonedState;
}
function deleteStep(state, payload) {
   let clonedState = _.cloneDeep(state);
   clonedState.config.sidebar = clonedState.config.sidebar.filter((el) => el.name !== payload.name);
   delete clonedState.config.mainContent[payload.name];
   if (payload.name === clonedState.currentStep.name) {
      return { ...clonedState, currentStep: {} };
   } else {
      return clonedState;
   }
}
function addEndpoint(state, payload) {
   let clonedState = _.cloneDeep(state);
   clonedState.config.endpoints[payload.name] = {
      baseURL: payload.baseURL,
      headers: payload.headerList.reduce((result, item) => {
         result[item.key] = item.value;
         return result;
      }, {}),
   };
   return clonedState;
}
function deleteEndpoint(state, payload) {
   let clonedState = _.cloneDeep(state);
   delete clonedState.config.endpoints[payload.name];
   return clonedState;
}
function addGlobalVar(state, payload) {
   let clonedState = _.cloneDeep(state);
   clonedState.config.globalVariables = {
      ...clonedState.config.globalVariables,
      [payload.name]: payload.val,
   };
   return clonedState;
}
function deleteGlobalVar(state, payload) {
   let clonedState = _.cloneDeep(state);
   delete clonedState.config.globalVariables[payload.name];
   return clonedState;
}

function globalContextreducer(state, action) {
   switch (action.type) {
      case "setCurrentStep":
         return { ...state, currentStep: { ...action.payload } };

      case "toggleMode":
         return { ...state, mode: state.mode === "edit" ? "presentation" : "edit" };

      case "setRunningStatus":
         if (!action.payload) {
            return { ...state, runningStatus: {} };
         } else {
            return { ...state, runningStatus: { ...state.runningStatus, [action.payload.step]: action.payload.status } };
         }

      case "replaceConfig":
         return { ...state, config: { ...action.payload } };

      case "clearStateHandler":
         for (let key in state.clearStateFunction) {
            if (typeof state.clearStateFunction[key] === "function") {
               state.clearStateFunction[key]();
            }
         }
         return { ...state };

      case "registerClearStateFunction":
         console.log("DEBUG - register cleanup function from", action.payload.key);
         return { ...state, clearStateFunction: { ...state.clearStateFunction, [action.payload.key]: action.payload.func } };

      case "unregisterClearStateFunction":
         delete state.clearStateFunction[action.payload.key];
         return { ...state };

      case "addAction":
         return { ...addAction(state, action.payload) };

      case "deleteAction":
         return { ...deleteAction(state, action.payload) };

      case "addStep":
         return { ...addStep(state, action.payload) };

      case "deleteStep":
         return { ...deleteStep(state, action.payload) };

      case "addEndpoint":
         return { ...addEndpoint(state, action.payload) };

      case "deleteEndpoint":
         return { ...deleteEndpoint(state, action.payload) };

      case "addGlobalVar":
         return { ...addGlobalVar(state, action.payload) };

      case "deleteGlobalVar":
         return { ...deleteGlobalVar(state, action.payload) };

      case "loadConfig":
         window.localStorage.clear();
         window.sessionStorage.clear();
         for (let key in state.clearStateFunction) {
            if (typeof state.clearStateFunction[key] === "function") {
               state.clearStateFunction[key]();
            }
         }
         window.localStorage.setItem("configData", JSON.stringify(action.payload));
         return { ...state, currentStep: {}, runningStatus: {}, config: { ...action.payload } };

      case "loadRunningStatus":
         return { ...state, runningStatus: { ...action.payload } };

      case "clearConfig":
         window.localStorage.clear();
         window.sessionStorage.clear();
         for (let key in state.clearStateFunction) {
            if (typeof state.clearStateFunction[key] === "function") {
               state.clearStateFunction[key]();
            }
         }
         return { ...state, currentStep: {}, runningStatus: {}, config: { ...config } };

      default:
         throw new Error(`Unhandled action type: ${action.type}`);
   }
}

function useGlobalContext() {
   const context = React.useContext(GlobalContext);

   if (!context) {
      throw new Error("useGlobalContext must be used within a ContextProvider");
   }
   return { context: context.state, dispatch: context.dispatch };
}

function ContextProvider({ children }) {
   const [state, dispatch] = useReducer(globalContextreducer, initState);
   useEffect(() => {
      const configData = window.localStorage.getItem("configData");
      const runningStatus = window.localStorage.getItem("runningStatus");
      // load config from localStorage if exist
      if (configData) dispatch({ type: "loadConfig", payload: JSON.parse(configData) });

      // load runningStatus from localStorage if exist
      if (runningStatus) dispatch({ type: "loadRunningStatus", payload: JSON.parse(runningStatus) });
   }, []);

   useEffect(() => {
      if (!_.isEmpty(state.runningStatus)) window.localStorage.setItem("runningStatus", JSON.stringify(state.runningStatus));
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [JSON.stringify(state.runningStatus)]);

   const value = { state, dispatch };
   return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
}

export { ContextProvider, useGlobalContext };

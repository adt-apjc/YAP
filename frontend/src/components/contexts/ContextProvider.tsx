import React, { useEffect, useReducer } from "react";
import config from "../../config/config.json";
import newConfig from "../../config/new.json";
import _ from "lodash";
import * as TYPE from "./ContextTypes";
import { useDidUpdateEffect } from "./CustomHooks";

const GlobalContext = React.createContext<TYPE.ContextType | null>(null);

let initState: TYPE.ContextState = {
   currentStep: config.preface ? { name: null, label: null } : { ...config.sidebar[0] },
   runningStatus: null,
   clearStateFunction: {},
   config: config,
   mode: "presentation",
};

function addAction(
   state: TYPE.ContextState,
   payload: { index: number | null; stepKey: string; tab: "actions" | "preCheck" | "postCheck"; actionObject: any }
) {
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
   return clonedState;
}

function deleteAction(
   state: TYPE.ContextState,
   payload: { index: number; stepKey: string; tab: "actions" | "preCheck" | "postCheck" }
) {
   let clonedState = _.cloneDeep(state);
   state.config.mainContent[payload.stepKey][payload.tab].splice(payload.index, 1);
   return clonedState;
}

function addStep(state: TYPE.ContextState, payload: { name: string }) {
   let clonedState = _.cloneDeep(state);
   let newStepName = `Step_${clonedState.config.sidebar.length + 1}`;
   clonedState.config.sidebar.push({ name: newStepName, label: payload.name });
   clonedState.config.mainContent[newStepName] = {
      description: "",
      continueOnFail: false,
      prefaceRef: 0,
      preCheck: [],
      actions: [],
      postCheck: [],
      outcome: [{}],
   };
   return clonedState;
}
function deleteStep(state: TYPE.ContextState, payload: { name: string }) {
   let clonedState = _.cloneDeep(state);
   clonedState.config.sidebar = clonedState.config.sidebar.filter((el: any) => el.name !== payload.name);
   delete clonedState.config.mainContent[payload.name];
   if (payload.name === clonedState.currentStep.name) {
      return { ...clonedState, currentStep: { name: null, label: null } };
   } else {
      return clonedState;
   }
}
function addEndpoint(
   state: TYPE.ContextState,
   payload: { name: string; baseURL: string; headerList: { key: string; value: string }[] }
) {
   let clonedState = _.cloneDeep(state);
   clonedState.config.endpoints[payload.name] = {
      baseURL: payload.baseURL,
      headers: payload.headerList.reduce((result: any, item) => {
         result[item.key] = item.value;
         return result;
      }, {}),
   };
   return clonedState;
}
function deleteEndpoint(state: TYPE.ContextState, payload: { name: string }) {
   let clonedState = _.cloneDeep(state);
   delete clonedState.config.endpoints[payload.name];
   return clonedState;
}
function addStaticVar(state: TYPE.ContextState, payload: { name: string; val: any }) {
   let clonedState = _.cloneDeep(state);
   clonedState.config.staticVariables = {
      ...clonedState.config.staticVariables,
      [payload.name]: payload.val,
   };
   return clonedState;
}
function deleteStaticVar(state: TYPE.ContextState, payload: { name: string }) {
   let clonedState = _.cloneDeep(state);
   if (clonedState.config.staticVariables) delete clonedState.config.staticVariables[payload.name];
   return clonedState;
}

function reorderAction(
   state: TYPE.ContextState,
   payload: { source: number; destination: number; stepKey: string; tab: "actions" | "preCheck" | "postCheck" }
) {
   const { stepKey, tab, source, destination } = payload;
   let clonedState = _.cloneDeep(state);
   const result = Array.from(clonedState.config.mainContent[stepKey][tab]);
   const [removed] = result.splice(source, 1);
   result.splice(destination, 0, removed);
   clonedState.config.mainContent[stepKey][tab] = result;
   return clonedState;
}

function globalContextreducer(state: TYPE.ContextState, action: TYPE.ContextAction) {
   switch (action.type) {
      case "setCurrentStep":
         return { ...state, currentStep: { ...action.payload } };

      case "toggleMode":
         return { ...state, mode: state.mode === "edit" ? ("presentation" as const) : ("edit" as const) };

      case "setRunningStatus":
         if (!action.payload) {
            return { ...state, runningStatus: null };
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

      case "addAction":
         return { ...addAction(state, action.payload) };

      case "deleteAction":
         return { ...deleteAction(state, action.payload) };

      case "reorderAction":
         return { ...reorderAction(state, action.payload) };

      case "addStep":
         return { ...addStep(state, action.payload) };

      case "deleteStep":
         return { ...deleteStep(state, action.payload) };

      case "addEndpoint":
         return { ...addEndpoint(state, action.payload) };

      case "deleteEndpoint":
         return { ...deleteEndpoint(state, action.payload) };

      case "addStaticVar":
         return { ...addStaticVar(state, action.payload) };

      case "deleteStaticVar":
         return { ...deleteStaticVar(state, action.payload) };

      case "loadConfig":
         window.localStorage.clear();
         for (let key in state.clearStateFunction) {
            if (typeof state.clearStateFunction[key] === "function") {
               state.clearStateFunction[key]();
            }
         }
         window.localStorage.setItem("__internal__configData", JSON.stringify(action.payload));
         return { ...state, currentStep: { name: null, label: null }, runningStatus: null, config: { ...action.payload } };

      case "loadRunningStatus":
         return { ...state, runningStatus: { ...action.payload } };

      case "clearConfig":
         window.localStorage.clear();
         for (let key in state.clearStateFunction) {
            if (typeof state.clearStateFunction[key] === "function") {
               state.clearStateFunction[key]();
            }
         }
         return { ...state, currentStep: { name: null, label: null }, runningStatus: null, config: { ...config } };

      case "newConfig":
         window.localStorage.clear();
         for (let key in state.clearStateFunction) {
            if (typeof state.clearStateFunction[key] === "function") {
               state.clearStateFunction[key]();
            }
         }
         return { ...state, currentStep: { name: null, label: null }, runningStatus: null, config: { ...newConfig } };

      default:
         throw new Error("Unhandled action");
   }
}

function useGlobalContext() {
   const context = React.useContext(GlobalContext);

   if (!context) {
      throw new Error("useGlobalContext must be used within a ContextProvider");
   }
   return { context: context.state, dispatch: context.dispatch };
}

function ContextProvider({ children }: { children: React.ReactNode }) {
   const [state, dispatch] = useReducer(globalContextreducer, initState);

   useEffect(() => {
      const configData = window.localStorage.getItem("__internal__configData");
      const runningStatus = window.localStorage.getItem("__internal__runningStatus");
      // load config from localStorage if exist
      if (configData) dispatch({ type: "replaceConfig", payload: JSON.parse(configData) });

      // load runningStatus from localStorage if exist
      if (runningStatus) dispatch({ type: "loadRunningStatus", payload: JSON.parse(runningStatus) });
   }, []);

   useDidUpdateEffect(() => {
      window.localStorage.setItem("__internal__configData", JSON.stringify(state.config));
   }, [JSON.stringify(state.config)]);

   useEffect(() => {
      if (!_.isEmpty(state.runningStatus))
         window.localStorage.setItem("__internal__runningStatus", JSON.stringify(state.runningStatus));
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [JSON.stringify(state.runningStatus)]);

   const value = { state, dispatch };
   return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
}

export { ContextProvider, useGlobalContext };

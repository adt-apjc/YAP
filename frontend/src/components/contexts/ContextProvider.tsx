import React, { useEffect, useReducer } from "react";
import newConfig from "../../config/new.json";
import _ from "lodash";
import * as TYPE from "./ContextTypes";
import { useDidUpdateEffect } from "./CustomHooks";

const GlobalContext = React.createContext<TYPE.ContextType | null>(null);

// Using an empty config instead of null to avoid forcing the tyscript validation clonedState.config
// YAP will never use this configuration because a title: "__emptyConfig__" doesn't generate an __internal__configData localStorage configuration
// If we make a routing mistake, it shall still render an empty demo instead of crashing the application
const emptyConfig: TYPE.config = {
   templateVersion: "",
   demoVersion: "",
   title: "__emptyConfig__",
   sidebar: [],
   navbar: {
      logoUrl: "",
      title: "",
      navBgColor: "",
      navFontColor: "",
   },
   preface: [],
   endpoints: {},
   sshCliEndpoints: {},
   mainContent: {},
};

let initState: TYPE.ContextState = {
   currentStep: { name: null, label: null },
   runningStatus: null,
   clearStateFunction: {},
   config: emptyConfig,
   mode: "presentation",
};

function copyOutcome(state: TYPE.ContextState, payload: { fromStep: string; toStep: string }) {
   let clonedState = _.cloneDeep(state);
   let outcome = clonedState.config.mainContent[payload.fromStep].outcome?.at(0);
   if (!outcome) {
      return clonedState;
   } else {
      if (clonedState.config.mainContent[payload.toStep].outcome !== undefined)
         clonedState.config.mainContent[payload.toStep].outcome![0] = { ...outcome };
      else clonedState.config.mainContent[payload.toStep].outcome = [{ ...outcome }];
      return clonedState;
   }
}

function copyAction(
   state: TYPE.ContextState,
   payload: {
      from: { index: number; step: string; tab: "actions" | "preCheck" | "postCheck" };
      to: { step: string; tab: "actions" | "preCheck" | "postCheck" };
   },
) {
   let clonedState = _.cloneDeep(state);
   let action = clonedState.config.mainContent[payload.from.step][payload.from.tab][payload.from.index];
   clonedState.config.mainContent[payload.to.step][payload.to.tab].push({ ...action });
   return clonedState;
}

function addAction(
   state: TYPE.ContextState,
   payload: { index: number | null; stepKey: string; tab: "actions" | "preCheck" | "postCheck"; actionObject: any },
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
   payload: { index: number; stepKey: string; tab: "actions" | "preCheck" | "postCheck" },
) {
   let clonedState = _.cloneDeep(state);
   clonedState.config.mainContent[payload.stepKey][payload.tab].splice(payload.index, 1);
   return clonedState;
}

function addStep(state: TYPE.ContextState, payload: { name: string; type: string; stepDetails?: any }) {
   let clonedState = _.cloneDeep(state);
   let maxStepNum = Math.max(...clonedState.config.sidebar.map((s) => parseInt(s.name.split("_")[1])));
   let newStepName = `Step_${maxStepNum + 1}`;
   clonedState.config.sidebar.push({ name: newStepName, label: payload.name });

   // if action is to add a new step use default stepDetails
   let stepDetails = {
      description: "",
      continueOnFail: false,
      prefaceRef: 0,
      preCheck: [],
      actions: [],
      postCheck: [],
      outcome: [{}],
   };

   // else if action is to duplicate a step
   // use payload.stepDetails
   // which contains the copy of the selected step details
   if (payload.type === "duplicateStep") stepDetails = payload.stepDetails;

   clonedState.config.mainContent[newStepName] = stepDetails;
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
   payload: { name: string; baseURL: string; headerList: { key: string; value: string }[] },
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

function updateEndpoint(
   state: TYPE.ContextState,
   payload: { oldName: string; name: string; baseURL: string; headerList: { key: string; value: string }[] },
) {
   let clonedState = _.cloneDeep(state);
   delete clonedState.config.endpoints[payload.oldName];

   clonedState.config.endpoints[payload.name] = {
      baseURL: payload.baseURL,
      headers: payload.headerList.reduce((result: any, item) => {
         result[item.key] = item.value;
         return result;
      }, {}),
   };
   return clonedState;
}

function addSSHEndpoint(
   state: TYPE.ContextState,
   payload: { name: string; hostname: string; port: string; username: string; password: string },
) {
   let clonedState = _.cloneDeep(state);

   if (!clonedState.config.sshCliEndpoints) clonedState.config.sshCliEndpoints = {};

   clonedState.config.sshCliEndpoints[payload.name] = {
      hostname: payload.hostname,
      port: payload.port,
      username: payload.username,
      password: payload.password,
   };
   return clonedState;
}

function updateSSHEndpoint(
   state: TYPE.ContextState,
   payload: { oldName: string; name: string; hostname: string; port: string; username: string; password: string },
) {
   let clonedState = _.cloneDeep(state);

   if (!clonedState.config.sshCliEndpoints) clonedState.config.sshCliEndpoints = {};

   delete clonedState.config.sshCliEndpoints[payload.oldName];

   clonedState.config.sshCliEndpoints[payload.name] = {
      hostname: payload.hostname,
      port: payload.port,
      username: payload.username,
      password: payload.password,
   };
   return clonedState;
}

function deleteEndpoint(state: TYPE.ContextState, payload: { name: string }) {
   let clonedState = _.cloneDeep(state);
   delete clonedState.config.endpoints[payload.name];
   return clonedState;
}

function deleteSSHEndpoint(state: TYPE.ContextState, payload: { name: string }) {
   let clonedState = _.cloneDeep(state);
   delete clonedState.config.sshCliEndpoints[payload.name];
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
   payload: { source: number; destination: number; stepKey: string; tab: "actions" | "preCheck" | "postCheck" },
) {
   const { stepKey, tab, source, destination } = payload;
   let clonedState = _.cloneDeep(state);
   const result = Array.from(clonedState.config.mainContent[stepKey][tab]);
   const [removed] = result.splice(source, 1);
   result.splice(destination, 0, removed);
   clonedState.config.mainContent[stepKey][tab] = result;
   return clonedState;
}

function reorderSideBarStep(state: TYPE.ContextState, payload: { source: number; destination: number }) {
   const { source, destination } = payload;
   let clonedState = _.cloneDeep(state);
   const result = Array.from(clonedState.config.sidebar);
   const [removed] = result.splice(source, 1);
   result.splice(destination, 0, removed);
   clonedState.config.sidebar = result;
   return clonedState;
}

function reorderPrefaceItem(state: TYPE.ContextState, payload: { source: number; destination: number }) {
   const { source, destination } = payload;
   let clonedState = _.cloneDeep(state);
   const result = Array.from(clonedState.config.preface);
   const [removed] = result.splice(source, 1);
   result.splice(destination, 0, removed);
   clonedState.config.preface = result;

   // create dictionary of new indexes for each preface step
   let newPrefaceOrder = result.map((e, i) => {
      return {
         stepName: clonedState.config.sidebar.find((el) => el.label.trim() === e.stepDesc)?.name,
         index: i,
      };
   });

   // update prefaceRef of each step in maincontent
   for (let step in clonedState.config.mainContent) {
      // get the new index from newPrefaceOrder dictionary
      let stepItem = newPrefaceOrder.find((e) => e.stepName === step);
      if (stepItem?.stepName) {
         // update prefaceRef
         clonedState.config.mainContent[stepItem.stepName].prefaceRef = stepItem.index;
      }
   }

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

      case "copyAction":
         return { ...copyAction(state, action.payload) };

      case "copyOutcome":
         return { ...copyOutcome(state, action.payload) };

      case "deleteAction":
         return { ...deleteAction(state, action.payload) };

      case "reorderAction":
         return { ...reorderAction(state, action.payload) };

      case "reorderSideBarStep":
         return { ...reorderSideBarStep(state, action.payload) };

      case "reorderPrefaceItem":
         return { ...reorderPrefaceItem(state, action.payload) };

      case "addStep":
         return { ...addStep(state, action.payload) };

      case "deleteStep":
         return { ...deleteStep(state, action.payload) };

      case "addEndpoint":
         return { ...addEndpoint(state, action.payload) };

      case "updateEndpoint":
         return { ...updateEndpoint(state, action.payload) };

      case "addSSHEndpoint":
         return { ...addSSHEndpoint(state, action.payload) };

      case "updateSSHEndpoint":
         return { ...updateSSHEndpoint(state, action.payload) };

      case "deleteEndpoint":
         return { ...deleteEndpoint(state, action.payload) };

      case "deleteSSHEndpoint":
         return { ...deleteSSHEndpoint(state, action.payload) };

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
         return { ...state, currentStep: { name: null, label: null }, runningStatus: null, config: emptyConfig };

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
      if (!_.isEmpty(state.config) && state.config.title !== "__emptyConfig__") {
         window.localStorage.setItem("__internal__configData", JSON.stringify(state.config));
      }
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

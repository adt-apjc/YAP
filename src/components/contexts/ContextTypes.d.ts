import cytoscape from "cytoscape";
import Outcome from "../MainContents/DemoContent/Outcome";

export type ContextActionType =
   | { type: "setCurrentStep"; payload: { name: string; label: string } }
   | { type: "toggleMode" }
   | { type: "setRunningStatus"; payload?: { step: string; status: "success" | "fail" | "running" } }
   | { type: "replaceConfig"; payload: any }
   | { type: "clearStateHandler" }
   | { type: "registerClearStateFunction"; payload: { key: string; func: () => any } }
   | { type: "unregisterClearStateFunction"; payload: { key: string } }
   | {
        type: "addAction";
        payload: { index: number; stepKey: string; tab: "actions" | "preCheck" | "postCheck"; actionObject: any };
     }
   | { type: "deleteAction"; payload: { index: number; stepKey: string; tab: "actions" | "preCheck" | "postCheck" } }
   | { type: "addStep"; payload: { name: string } }
   | { type: "deleteStep"; payload: { name: string } }
   | { type: "addEndpoint"; payload: { name: string; baseURL: string; headerList: { key: any; value: any }[] } }
   | { type: "deleteEndpoint"; payload: { name: string } }
   | { type: "addStaticVar"; payload: { name: string; val: any } }
   | { type: "deleteStaticVar"; payload: { name: string } }
   | { type: "loadConfig"; payload: any }
   | { type: "loadRunningStatus"; payload: any }
   | { type: "clearConfig" }
   | { type: "newConfig" };

export type OutcomeType = {
   summaryText?: string;
   elements?: { nodes: cytoscape.ElementDefinition[]; edges: cytoscape.ElementDefinition[] };
   commands?: { [key: string]: OutcomeCommandType[] };
};

export type EndpointType = {
   baseURL: string;
   headers?: { [key: string]: string };
};

export type OutcomeCommandType = {
   type: string;
   title: string;
   useEndpoint: string;
   url: string;
   method: string;
   data?: any;
   displayResponseAs?: string;
   objectPath?: string; // objectPath use incase displayResponseAs:"text" as you need to show specific value
};

export type ActionType = {
   type: string;
   useEndpoint: string;
   header: string;
   headerColor: string;
   title: string;
   description: string;
   url: string;
   method: string;
   displayResponseAs?: string;
   objectPath?: string; // objectPath use incase displayResponseAs:"text" as you need to show specific value
   data?: any;
   expect: { type: string; value: any }[];
   match?: { objectPath: string; regEx: string; matchGroup: string; storeAs: string };
};

export type PrefaceConfig = {
   stepDesc: string;
   bodyMarkdown: string;
};

export type config = {
   version: string;
   title: string;
   sidebar: { name: string; label: string }[];
   navbar: {
      logoUrl: string;
      title: string;
      navBgColor: string;
      navFontColor: string;
   };
   preface: PrefaceConfig[];
   endpoints: {
      [name: string]: EndpointType;
   };
   staticVariables: { [key: string]: string };
   mainContent: {
      [step: string]: {
         description?: string;
         prefaceRef?: number;
         continueOnFail: boolean;
         preCheck: ActionType[];
         actions: ActionType[];
         postCheck: ActionType[];
         outcome?: OutcomeType[];
      };
   };
};

export type StateType = {
   currentStep: { name: string | null; label: string | null };
   runningStatus: { [k: string]: "success" | "fail" | "running" } | null;
   clearStateFunction: { [k: string]: () => void } | null;
   config: config;
   mode: "presentation" | "edit";
};

export type ContextType = { state: StateType; dispatch: React.Dispatch<ContextActionType> };

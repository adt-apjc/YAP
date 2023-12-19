import cytoscape from "cytoscape";
import Outcome from "../MainContents/DemoContent/Outcome";
import SSHEndpoint from "../NavigationBar/Settings/SSHEndpoint";

export type ContextAction =
   | { type: "setCurrentStep"; payload: { name: string | null; label: string | null } }
   | { type: "toggleMode" }
   | { type: "setRunningStatus"; payload?: { step: string; status: "success" | "fail" | "running" | "" } }
   | { type: "replaceConfig"; payload: any }
   | { type: "clearStateHandler" }
   | {
        type: "addAction";
        payload: { index: number | null; stepKey: string; tab: "actions" | "preCheck" | "postCheck"; actionObject: any };
     }
   | {
        type: "copyAction";
        payload: {
           from: { index: number; step: string; tab: "actions" | "preCheck" | "postCheck" };
           to: { step: string; tab: "actions" | "preCheck" | "postCheck" };
        };
     }
   | {
        type: "copyOutcome";
        payload: { fromStep: string; toStep: string };
     }
   | {
        type: "reorderAction";
        payload: { source: number; destination: number; stepKey: string; tab: "actions" | "preCheck" | "postCheck" };
     }
   | {
        type: "reorderSideBarStep";
        payload: { source: number; destination: number };
     }
   | {
        type: "reorderPrefaceItem";
        payload: { source: number; destination: number };
     }
   | { type: "deleteAction"; payload: { index: number; stepKey: string; tab: "actions" | "preCheck" | "postCheck" } }
   | { type: "addStep"; payload: { name: string; type: string; stepDetails?: StepDetails } }
   | { type: "deleteStep"; payload: { name: string } }
   | { type: "addEndpoint"; payload: { name: string; baseURL: string; headerList: { key: any; value: any }[] } }
   | {
        type: "updateEndpoint";
        payload: { oldName: string; name: string; baseURL: string; headerList: { key: any; value: any }[] };
     }
   | {
        type: "addSSHEndpoint";
        payload: { name: string } & SSHCliEndpointConfig;
     }
   | {
        type: "updateSSHEndpoint";
        payload: { oldName: string; name: string } & SSHCliEndpointConfig;
     }
   | { type: "deleteEndpoint"; payload: { name: string } }
   | { type: "deleteSSHEndpoint"; payload: { name: string } }
   | { type: "addStaticVar"; payload: { name: string; val: any } }
   | { type: "updateStaticVar"; payload: { oldName: string; name: string; val: any } }
   | { type: "deleteStaticVar"; payload: { name: string } }
   | { type: "loadConfig"; payload: any }
   | { type: "loadRunningStatus"; payload: any }
   | { type: "clearConfig" }
   | { type: "newConfig" };

export type SSHConfig = {
   inheritFrom?: string;
   hostname?: string;
   username?: string;
   password?: string;
   port?: string;
   sshkey?: string;
   keyFilename?: string;
   commands?: { label: string; command: string }[];
};

export type OutcomeConfig = {
   summaryText?: string;
   elements?: { nodes: cytoscape.ElementDefinition[]; edges: cytoscape.ElementDefinition[] };
   commands?: { [key: string]: OutcomeCommandConfig[] };
   ssh?: { [key: string]: SSHConfig };
};

export type EndpointConfig = {
   baseURL: string;
   backendRequest?: boolean; // default [true]
   headers?: { [key: string]: string };
};

export type SSHCliEndpointConfig = {
   hostname: string;
   port: string;
   username: string;
   password?: string;
   deviceType: "linux" | "cisco-ios";
   promptRegex: string;
   sshkey?: string;
   keyFilename?: string;
};

export type OutcomeCommandConfig = {
   type: string;
   title: string;
   useEndpoint: string;
   url: string;
   method: string;
   data?: any;
   displayResponseAs?: string;
   maxRetry?: string;
   interval?: string;
   objectPath?: string; // objectPath use incase displayResponseAs:"text" as you need to show specific value
};

export type ActionExpectObject = { type: string; value: any }[];
export type ActionMatchObject = { objectPath: string; regEx: string; matchGroup: string; storeAs: string };

export type RestActionConfig = {
   type: "request" | "polling";
   title: string;
   useEndpoint: string;
   url: string;
   method: string;
   apiBadge: string;
   apiBadgeColor: string;
   description: string;
   data?: any;
   payloadType?: string;
   sessionTimeout?: number; // in seconds, default 60 if not set
   maxRetry?: string;
   interval?: string;
   displayResponseAs?: string;
   objectPath?: string; // objectPath use incase displayResponseAs:"text" as you need to show specific value
   expect?: ActionExpectObject;
   match?: ActionMatchObject;
   headers?: { [key: string]: string }; // option to override Axois request header from Endpoint
};

export type SSHActionConfig = {
   type: "ssh-cli";
   title: string;
   useEndpoint: string;
   apiBadge?: string;
   apiBadgeColor?: string;
   description: string;
   displayResponseAs?: string;
   payloadType?: string;
   sessionTimeout?: number; // in seconds, default 60 if not set
   data?: any;
   expect?: ActionExpectObject;
   match?: ActionMatchObject;
};

export type ActionConfig = RestActionConfig | SSHActionConfig;

export type PrefaceConfig = {
   stepDesc: string;
   bodyMarkdown: string;
};

export type StepDetails = {
   description?: string;
   prefaceRef?: number;
   continueOnFail: boolean;
   preCheck: ActionConfig[];
   actions: ActionConfig[];
   postCheck: ActionConfig[];
   outcome?: OutcomeConfig[];
   clearVariables?: boolean;
};

export type StaticVariables = { [key: string]: string };

export type config = {
   templateVersion: string;
   demoVersion: string;
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
      [name: string]: EndpointConfig;
   };
   sshCliEndpoints: {
      [name: string]: SSHCliEndpointConfig;
   };
   staticVariables?: StaticVariables;
   mainContent: {
      [step: string]: StepDetails;
   };
};

export type ContextState = {
   currentStep: { name: string | null; label: string | null };
   runningStatus: { [k: string]: "success" | "fail" | "running" | "" } | null;
   clearStateFunction: { [k: string]: () => void } | null;
   config: config;
   mode: "presentation" | "edit";
};

export type ContextType = { state: ContextState; dispatch: React.Dispatch<ContextAction> };

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
   | { type: "addEndpoint"; payload: { name: string; baseURL: string; headerList: [] } }
   | { type: "deleteEndpoint"; payload: { name: string } }
   | { type: "addStaticVar"; payload: { name: string; val: any } }
   | { type: "deleteStaticVar"; payload: { name: string } }
   | { type: "loadConfig"; payload: any }
   | { type: "loadRunningStatus"; payload: any }
   | { type: "clearConfig" };

type ActionType = {
   type: string;
   useEndpoint: string;
   header: string;
   headerColor: string;
   title: string;
   description: string;
   url: string;
   method: string;
   data: any;
   expect: { type: string; value: any }[];
   match?: { objectPath: string; regEx: string; matchGroup: string; storeAs: string };
};

export type PrefaceConfig = {
   title: string;
   stepDesc: string;
   bodyArr: string[];
};

export type config = {
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
      [name: string]: {
         baseURL: string;
         headers?: { [key: string]: string };
      };
   };
   staticVariables: { [key: string]: string };
   mainContent: {
      [step: string]: {
         description?: string[];
         prefaceRef?: number;
         continueOnFail: boolean;
         preCheck: ActionType[];
         actions: ActionType[];
         postCheck: ActionType[];
         outcome?: any[];
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

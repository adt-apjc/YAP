export type ContextActionType =
   | { type: "setCurrentStep"; payload: { name: string; label: string } }
   | { type: "toggleMode" }
   | { type: "setRunningStatus"; payload?: { step: string; status: "success" | "fail" | "running" } }
   | { type: "replaceConfig"; payload: any }
   | { type: "clearStateHandler" }
   | { type: "registerClearStateFunction"; payload: { key: string; func: () => any } }
   | { type: "unregisterClearStateFunction"; payload: { key: string } }
   | { type: "addAction"; payload: { index: number; stepKey: string; tab: string; actionObject: any } }
   | { type: "deleteAction"; payload: { index: number; stepKey: string; tab: string } }
   | { type: "addStep"; payload: { name: string } }
   | { type: "deleteStep"; payload: { name: string } }
   | { type: "addEndpoint"; payload: { name: string; baseURL: string; headerList: [] } }
   | { type: "deleteEndpoint"; payload: { name: string } }
   | { type: "loadConfig"; payload: any }
   | { type: "loadRunningStatus"; payload: any }
   | { type: "clearConfig" };

export type StateType = {
   currentStep: { name: string | null; label: string | null };
   runningStatus: { [k: string]: "success" | "fail" | "running" } | null;
   clearStateFunction: { [k: string]: () => void } | null;
   config: any;
   mode: "presentation" | "edit";
};

export type ContextType = { state: StateType; dispatch: React.Dispatch<ContextActionType> };

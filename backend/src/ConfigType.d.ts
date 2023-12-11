import { AxiosResponse } from "axios";

export type EndpointConfig = {
   baseURL: string;
   backendRequest?: boolean; // default [true]
   headers?: { [key: string]: string };
};

export type ActionExpectObject = { type: string; value: any }[];
export type ActionMatchObject = { objectPath: string; regEx: string; matchGroup: string; storeAs: string };

export type ActionConfig = {
   type: string;
   title: string;
   useEndpoint: string;
   url: string;
   method: string;
   apiBadge: string;
   apiBadgeColor: string;
   description: string;
   data?: any;
   payloadType?: string;
   maxRetry?: string;
   interval?: string;
   displayResponseAs?: string;
   objectPath?: string; // objectPath use incase displayResponseAs:"text" as you need to show specific value
   expect?: ActionExpectObject;
   match?: ActionMatchObject;
   headers?: { [key: string]: string }; // option to override Axois request header from Endpoint
};

export type PrefaceConfig = {
   stepDesc: string;
   bodyMarkdown: string;
};

export type StepDetails = {
   description?: string;
   continueOnFail: boolean;
   preCheck: ActionConfig[];
   actions: ActionConfig[];
   postCheck: ActionConfig[];
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
   staticVariables?: StaticVariables;
   mainContent: {
      [step: string]: StepDetails;
   };
};

type StepResult = {
   [step: string]: { [index: number]: AxiosResponse & { success: boolean; statusText?: string } } | undefined;
};

export type ApiResponseData = {
   preCheckResults: StepResult;
   actionResults: StepResult;
   postCheckResults: StepResult;
} | null;

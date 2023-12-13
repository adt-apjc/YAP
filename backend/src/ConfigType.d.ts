import { AxiosResponse } from "axios";

export type EndpointConfig = {
   baseURL: string;
   backendRequest?: boolean; // default [true]
   headers?: { [key: string]: string };
};

export type SSHEndpointConfig = {
   baseURL: string;
   hostname: string;
   port: string;
   username: string;
   password: string;
   deviceType: string;
   promptRegex: string;
};

export type ActionExpectObject = { type: string; value: any }[];

export type ActionMatchObject = { objectPath: string; regEx: string; matchGroup: string; storeAs: string };

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

export type ActionConfig = RestActionConfig | SSHActionConfig;

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
   sshCliEndpoints: {
      [name: string]: SSHEndpointConfig;
   };
   staticVariables?: StaticVariables;
   mainContent: {
      [step: string]: StepDetails;
   };
};

type RestAPIResponse = (AxiosResponse & { success: boolean; failureCause?: string }) | undefined;
type SSHCliResponse = { response: string; success: boolean; failureCause?: string };

type StepResult<T> = {
   [step: string]: { [index: number]: T };
};

export type RestAPIResponseData = {
   preCheckResults: StepResult<RestAPIResponse>;
   actionResults: StepResult<RestAPIResponse>;
   postCheckResults: StepResult<RestAPIResponse>;
} | null;

export type SSHCliResponseData = {
   preCheckResults: StepResult<SSHCliResponse>;
   actionResults: StepResult<SSHCliResponse>;
   postCheckResults: StepResult<SSHCliResponse>;
} | null;

export type ResponseData = RestAPIResponseData | SSHCliResponseData;

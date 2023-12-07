import axios, { AxiosResponse } from "axios";
import {
   ActionExpectObject,
   ActionConfig,
   StaticVariables,
   config,
   RestActionConfig,
   SSHActionConfig,
} from "../components/contexts/ContextTypes";
import { io } from "socket.io-client";
import { APIResponse, SSHCLIResponse } from "./apiAction";

const validateExpect = (expect: ActionExpectObject, response: AxiosResponse) => {
   let failureCause = "";
   if (expect.length === 0) return { expectCriteriaMet: true, failureCause };

   for (let condition of expect) {
      switch (condition.type) {
         case "bodyContain":
            // Note: using JSON.stringify(condition.value) on condition.value to add the proper escapes buut forced to slice(1, -1)
            // to remove start and stop " added by the stringify function on a string that would preclude the match

            if (!JSON.stringify(response.data).includes(JSON.stringify(condition.value).slice(1, -1))) {
               console.log(`DEBUG - ${condition.type} ${JSON.stringify(condition.value).slice(1, -1)} didn't match`);
               failureCause = "Expect criteria bodyContain didn't match.";
               return { expectCriteriaMet: false, failureCause };
            }
            break;
         case "bodyNotContain":
            if (JSON.stringify(response.data).includes(JSON.stringify(condition.value).slice(1, -1))) {
               console.log(`DEBUG - ${condition.type} ${JSON.stringify(condition.value).slice(1, -1)} didn't match`);
               failureCause = "Expect criteria bodyNotContain didn't match.";
               return { expectCriteriaMet: false, failureCause };
            }
            break;
         case "codeIs":
            // code may be a single string or an array of string, where one need to match the value expected
            if (!condition.value.includes(response.status.toString())) {
               console.log(`DEBUG - ${condition.type} ${condition.value} didn't match (Response ${response.status})`);
               failureCause = "Expect criteria HttpResponseCodeIs didn't match.";
               return { expectCriteriaMet: false, failureCause };
            }
            break;
         default:
            console.log(`ERROR - Unknown expect type ${condition.type}`);
      }
   }
   return { expectCriteriaMet: true, failureCause };
};

const validateExpectText = (expect: ActionExpectObject, response: String) => {
   let failureCause = "";
   if (expect.length === 0) return { expectCriteriaMet: true, failureCause };

   for (let condition of expect) {
      switch (condition.type) {
         case "bodyContain":
            if (!response.includes(condition.value)) {
               console.log(`DEBUG - ${condition.type} ${condition.value} didn't match`);
               failureCause = "Expect criteria bodyContain didn't match.";
               return { expectCriteriaMet: false, failureCause };
            }
            break;
         case "bodyNotContain":
            if (response.includes(condition.value)) {
               console.log(`DEBUG - ${condition.type} ${condition.value} didn't match`);
               failureCause = "Expect criteria bodyNotContain didn't match.";
               return { expectCriteriaMet: false, failureCause };
            }
            break;
         default:
            console.log(`ERROR - Unknown expect type ${condition.type}`);
      }
   }
   return { expectCriteriaMet: true, failureCause };
};

const processMatchResponse = (actionObject: ActionConfig, response: AxiosResponse) => {
   if (actionObject.match) {
      let { objectPath, regEx, storeAs, matchGroup } = actionObject.match;
      let reservedNames = ["__internal__configData", "__internal__mainContentState", "__internal__runningStatus"];
      if (reservedNames.includes(storeAs)) return; // var name cannot be the same as reserved list

      let targetValue = getStringFromObject(response.data, objectPath);
      // If RegEx configured
      let re = new RegExp(regEx);
      let matchedValue = targetValue.match(re);
      if (matchedValue) {
         // If RegEx match
         let group = matchGroup ? parseInt(matchGroup) : 0;
         localStorage.setItem(storeAs, matchedValue[group]);
         console.log("DEBUG:", matchedValue[group], "store as", storeAs);
      }
   }
};

const getStringFromObject = (obj: any, path: string | undefined): string => {
   let result = obj;
   try {
      if (!path)
         if (typeof result === "string") return result;
         else return JSON.stringify(result, null, 3);
      for (let attr of path.split(".")) {
         result = result[attr];
      }
      return result.toString();
   } catch (err) {
      return "";
   }
};

const replaceStrWithParams = (text: any, staticVariables: StaticVariables | undefined) => {
   console.log("DEBUG - replacing params", text);
   let regex = /\{\{[A-Za-z_-]+[A-Za-z_0-9-]*\}\}/g;
   // if text is undefined or null return as it is.
   if (!text) return text;
   //
   if (typeof text === "string") {
      let match = text.match(regex);
      if (match) {
         let replacedText = text;
         for (let varname of match) {
            let stripedVarname = varname.replace(/[{}]/g, "");
            if (staticVariables && staticVariables[stripedVarname]) {
               replacedText = replacedText.replace(varname, staticVariables[stripedVarname]);
            } else {
               replacedText = replacedText.replace(varname, localStorage.getItem(stripedVarname) || "VAR_UNDEFINED");
            }
            console.log("DEBUG - params replaced", replacedText);
         }
         return replacedText;
      }
   } else if (typeof text === "object") {
      let strText = JSON.stringify(text);
      let match = strText.match(regex);
      if (match) {
         let replacedText = strText;
         for (let varname of match) {
            let stripedVarname = varname.replace(/[{}]/g, "");
            if (staticVariables && staticVariables[stripedVarname]) {
               replacedText = replacedText.replace(varname, staticVariables[stripedVarname]);
            } else {
               replacedText = replacedText.replace(varname, localStorage.getItem(stripedVarname) || "VAR_UNDEFINED");
            }
            console.log("DEBUG - params replaced", replacedText);
         }
         return JSON.parse(replacedText);
      }
   }
   // return original one if not match
   return text;
};

export const normalRequest = (actionObject: RestActionConfig, { endpoints, staticVariables }: config): Promise<APIResponse> => {
   if (!("expect" in actionObject)) {
      actionObject.expect = [];
   }
   let config = {
      baseURL: endpoints[actionObject.useEndpoint].baseURL,
      headers:
         actionObject.headers && Object.keys(actionObject.headers).length > 0
            ? replaceStrWithParams(actionObject.headers, staticVariables)
            : replaceStrWithParams(endpoints[actionObject.useEndpoint].headers, staticVariables),
      url: replaceStrWithParams(actionObject.url, staticVariables),
      method: actionObject.method,
      data: replaceStrWithParams(actionObject.data, staticVariables),
   };

   return new Promise(async (resolve, reject) => {
      try {
         let response: AxiosResponse;
         if (
            endpoints[actionObject.useEndpoint].backendRequest ||
            endpoints[actionObject.useEndpoint].backendRequest === undefined
         ) {
            response = await axios.post(`${process.env.REACT_APP_API_URL!.replace(/\/+$/, "")}/proxy/request`, { ...config });
         } else {
            response = await axios(config);
         }
         console.log("DEBUG - response from normalRequest", response);
         // process Match response if configured
         processMatchResponse(actionObject, response);
         // if expect has any condition, we shall validate them before assume a success: true state
         if (actionObject.expect!.length > 0) {
            let { expectCriteriaMet, failureCause } = validateExpect(actionObject.expect!, response);
            if (!expectCriteriaMet) {
               console.log("DEBUG - conditions haven't been met", actionObject.expect);
               reject({ ...response, failureCause, success: false });
            }
         }
         resolve({ ...response, success: true });
      } catch (e: any) {
         console.log("REQUEST ERROR - ", e);
         if (e.response) {
            let { expectCriteriaMet } = validateExpect(actionObject.expect!, e.response);
            if (actionObject.expect!.length > 0 && expectCriteriaMet) {
               // special case to handle 404 exception (which may be acceptable) - TBA any other case?
               e.response.success = true;
               console.log("DEBUG - Criteria hit on 404 which is accepted");
               resolve(e.response);
            } else {
               reject({
                  ...e.response,
                  failureCause: e.response.data ? e.response.data : "Response with HTTP error code (4XX/5XX).",
                  success: false,
               });
            }
         } else {
            reject({ status: "Error", statusText: "connect ECONNREFUSED", success: false });
         }
      }
   });
};

export const pollingRequest = (actionObject: RestActionConfig, { endpoints, staticVariables }: config): Promise<APIResponse> => {
   let interval = actionObject.interval ? parseInt(actionObject.interval) : 5000;
   let maxRetry = actionObject.maxRetry ? parseInt(actionObject.maxRetry) : 10;
   if (!("expect" in actionObject)) {
      actionObject.expect = [];
   }
   let config = {
      baseURL: endpoints[actionObject.useEndpoint].baseURL,
      headers: actionObject.headers
         ? replaceStrWithParams(actionObject.headers, staticVariables)
         : replaceStrWithParams(endpoints[actionObject.useEndpoint].headers, staticVariables),
      url: replaceStrWithParams(actionObject.url, staticVariables),
      method: actionObject.method,
      data: replaceStrWithParams(actionObject.data, staticVariables),
   };

   let response: AxiosResponse;
   let counterFlag = 1;
   console.log("action", actionObject);
   console.log("axiosConfig", config);

   return new Promise((resolve, reject) => {
      let timer = setInterval(async () => {
         try {
            if (
               endpoints[actionObject.useEndpoint].backendRequest ||
               endpoints[actionObject.useEndpoint].backendRequest === undefined
            ) {
               response = await axios.post(`${process.env.REACT_APP_API_URL!.replace(/\/+$/, "")}/proxy/request`, { ...config });
            } else {
               response = await axios(config);
            }
            if (counterFlag <= maxRetry) {
               console.log("polling", counterFlag, response, actionObject.expect);
               // if expect has any condition, we shall validate them before assume a success: true state
               let { expectCriteriaMet } = validateExpect(actionObject.expect!, response);
               if (actionObject.expect!.length > 0 && expectCriteriaMet) {
                  console.log("INFO - Resolved and testing condition have been met", actionObject.expect);
                  clearInterval(timer);
                  resolve({ ...response, success: true });
               }
            } else {
               clearInterval(timer);
               if (actionObject.expect!.length > 0) {
                  // this case mean runtime exceed maxRetry and expect was set and it still not hit the criteria
                  reject({
                     ...response,
                     failureCause: "Criteria was not met in the proposed polling time",
                     success: false,
                  });
               } else {
                  // this case mean runtime exceed maxRetry and expect not set
                  // we will assume that it success. in case user want to polling for a specific time and dont expect anything in response.
                  resolve({ ...response, success: true });
               }
            }
         } catch (e: any) {
            console.log("REQUEST ERROR - ", e);
            // By default AXIOS assumes a 404 as an issue but we need validation where 404 is an expected
            // or acceptable value.
            // if 404 is returned as a code, check if it is acceptable as condition, if it is:
            // - set the special case flag e.response.success to true;
            // resolve the promise sucessfully
            let { expectCriteriaMet } = validateExpect(actionObject.expect!, e.response);
            if (e.response && actionObject.expect!.length > 0 && expectCriteriaMet) {
               console.log("DEBUG - Criteria hit on 404 which is accepted");
               clearInterval(timer);
               resolve({ ...e.response, success: true });
            }

            if (counterFlag === maxRetry) {
               clearInterval(timer);
               if (e.response) {
                  reject({ ...e.response, success: false });
               } else {
                  reject({ status: "Error", statusText: "connect ECONNREFUSED", success: false });
               }
            }
         }
         counterFlag++;
      }, interval);
   });
};

export const sshCliAction = (
   actionObject: SSHActionConfig,
   { sshCliEndpoints, staticVariables }: config,
): Promise<SSHCLIResponse> => {
   const { hostname, username, password, port, promptRegex, deviceType } = sshCliEndpoints[actionObject.useEndpoint];
   const cmdList: string[] = replaceStrWithParams(actionObject.data, staticVariables).split("\n");
   let timeout = actionObject.sessionTimeout ? actionObject.sessionTimeout * 1000 : 60 * 1000;
   let regexList = [promptRegex, "yes/no", "yes/no\\?", "\\(yes/no/cancel\\)\\?"].map((item) => new RegExp(item));

   if (deviceType === "cisco-ios") cmdList.unshift("terminal length 0");

   return new Promise((resolve, reject) => {
      let response = "";
      try {
         const socket = io(process.env.REACT_APP_API_URL!, {
            query: { hostname, username, password, port },
         });

         let timer = setTimeout(() => {
            socket.disconnect();
            reject({ response, success: false, failureCause: "Session timeout" });
         }, timeout);

         socket.on("sshconnect", () => {
            console.log("DEBUG - SSH connected");
            console.log("DEBUG - cmdlist", cmdList);
         });
         socket.on("data", function (data: string) {
            response += data;

            if (regexList.some((regex) => regex.test(data))) {
               if (cmdList.length > 0) socket.emit("data", cmdList.shift() + "\n");
               else {
                  socket.disconnect();
                  let { expectCriteriaMet } = validateExpectText(actionObject.expect!, response);
                  if (!expectCriteriaMet) {
                     console.log("DEBUG - conditions haven't been met", actionObject.expect);
                     clearTimeout(timer);
                     reject({ response, success: false, failureCause: "Expect criteria didn't match." });
                  } else {
                     clearTimeout(timer);
                     resolve({ response, success: true });
                  }
               }
            }
         });
         socket.on("ssherror", function (data: string) {
            socket.disconnect();
            clearTimeout(timer);
            reject({ response: "", success: false, failureCause: data });
         });
         socket.on("sshclose", () => {
            socket.disconnect();
            clearTimeout(timer);
            let { expectCriteriaMet } = validateExpectText(actionObject.expect!, response);
            if (!expectCriteriaMet) {
               console.log("DEBUG - conditions haven't been met", actionObject.expect);
               reject({ response, success: false, failureCause: "Expect criteria didn't match." });
            } else {
               resolve({ response, success: true });
            }
         });
      } catch (err: any) {
         reject({ response: "", success: false, failureCause: err.message });
      }
   });
};

import axios, { AxiosResponse } from "axios";
import { ActionExpectObject, ActionConfig, StaticVariables, config } from "../components/contexts/ContextTypes";
import { APIResponse } from "./apiAction";

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

const processMatchResponse = (actionObject: ActionConfig, response: AxiosResponse) => {
   if (actionObject.match) {
      let { objectPath, regEx, storeAs, matchGroup } = actionObject.match;
      let targetValue =
         actionObject.configurePayload?.displayResponseAs === "text"
            ? response.data
            : getStringFromObject(response.data, objectPath);
      // If RegEx configured
      let re = new RegExp(regEx);
      let matchedValue = targetValue.match(re);
      if (matchedValue) {
         // If RegEx match
         let group = matchGroup ? parseInt(matchGroup) : 0;
         sessionStorage.setItem(storeAs, matchedValue[group]);
         console.log("DEBUG:", matchedValue[group], "store as", storeAs);
      } else {
         sessionStorage.setItem(storeAs, matchedValue);
         console.log("DEBUG:", matchedValue, "store as", storeAs);
      }
   }
};

const getStringFromObject = (obj: any, path: string): string => {
   let result = obj;
   try {
      for (let attr of path.split(".")) {
         result = result[attr];
      }
      return result.toString();
   } catch (err) {
      return "";
   }
};

const replaceStrWithParams = (text: any, staticVariables: StaticVariables) => {
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
            if (staticVariables[stripedVarname]) {
               replacedText = replacedText.replace(varname, staticVariables[stripedVarname]);
            } else {
               replacedText = replacedText.replace(varname, sessionStorage.getItem(stripedVarname) || "VAR_UNDEFINED");
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
            if (staticVariables[stripedVarname]) {
               replacedText = replacedText.replace(varname, staticVariables[stripedVarname]);
            } else {
               replacedText = replacedText.replace(varname, sessionStorage.getItem(stripedVarname) || "VAR_UNDEFINED");
            }
            console.log("DEBUG - params replaced", replacedText);
         }
         return JSON.parse(replacedText);
      }
   }
   // return original one if not match
   return text;
};

export const normalRequest = (actionObject: ActionConfig, { endpoints, staticVariables }: config): Promise<APIResponse> => {
   if (!("expect" in actionObject)) {
      actionObject.expect = [];
   }
   let config = {
      baseURL: actionObject.baseURL ? actionObject.baseURL : endpoints[actionObject.useEndpoint].baseURL,
      headers: actionObject.headers
         ? replaceStrWithParams(actionObject.headers, staticVariables)
         : replaceStrWithParams(endpoints[actionObject.useEndpoint].headers, staticVariables),
      url: replaceStrWithParams(actionObject.url, staticVariables),
      method: actionObject.method,
      data: replaceStrWithParams(actionObject.data, staticVariables),
   };
   // if username/password was set, overwrite Auth
   if (endpoints[actionObject.useEndpoint].username && endpoints[actionObject.useEndpoint].password) {
      config.headers.Authorization =
         "Basic " + btoa(`${endpoints[actionObject.useEndpoint].username}:${endpoints[actionObject.useEndpoint].password}`);
   }

   return new Promise(async (resolve, reject) => {
      try {
         const response = await axios(config);
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
               reject({ ...e.response, failureCause: "Response with HTTP error code (4XX/5XX).", success: false });
            }
         } else {
            reject({ status: "Error", statusText: "connect ECONNREFUSED", success: false });
         }
      }
   });
};

export const pollingRequest = (actionObject: ActionConfig, { endpoints, staticVariables }: config): Promise<APIResponse> => {
   let interval = actionObject.interval ? parseInt(actionObject.interval) : 5000;
   let maxRetry = actionObject.maxRetry ? parseInt(actionObject.maxRetry) : 10;
   if (!("expect" in actionObject)) {
      actionObject.expect = [];
   }
   let config = {
      baseURL: actionObject.baseURL ? actionObject.baseURL : endpoints[actionObject.useEndpoint].baseURL,
      headers: actionObject.headers
         ? replaceStrWithParams(actionObject.headers, staticVariables)
         : replaceStrWithParams(endpoints[actionObject.useEndpoint].headers, staticVariables),
      url: replaceStrWithParams(actionObject.url, staticVariables),
      method: actionObject.method,
      data: replaceStrWithParams(actionObject.data, staticVariables),
   };
   // if username/password was set, overwrite Auth
   if (endpoints[actionObject.useEndpoint].username && endpoints[actionObject.useEndpoint].password) {
      config.headers.Authorization =
         "Basic " + btoa(`${endpoints[actionObject.useEndpoint].username}:${endpoints[actionObject.useEndpoint].password}`);
   }
   let response;
   let counterFlag = 1;
   console.log("action", actionObject);
   console.log("axiosConfig", config);

   return new Promise((resolve, reject) => {
      let timer = setInterval(async () => {
         try {
            response = await axios(config);
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

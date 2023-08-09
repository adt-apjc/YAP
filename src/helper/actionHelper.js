import axios from "axios";

const validateExpect = (expect, response) => {
   // expect is an array of conditions. As MVP0 all (AND) must be true to return a true value
   for (let condition of expect) {
      switch (condition.type) {
         case "bodyContain":
            if (JSON.stringify(response.data).includes(condition.value)) {
               return true;
            }
            break;
         case "codeIs":
            // code may be a single string or an array of string, where one need to match the value expected
            console.log("DEBUG condition (response.status/condition.value): ", response.status, condition.value);

            if (condition.value.includes(JSON.stringify(response.status))) {
               console.log("DEBUG (response.status/condition.value) - MATCHED ", response.status, condition.value);
               return true;
            }
            break;
         default:
            console.log(`ERROR - Unknown expect type ${condition.type}`);
      }
   }
   // By default the condition is not matched
   console.log("DEBUG - validateExpect, No condition have been matched");
   return false;
};

const processMatchResponse = (actionObject, response) => {
   if (actionObject.match) {
      let targetValue = getStringFromObject(response.data, actionObject.match.objectPath);
      // If RegEx configured
      let re = new RegExp(actionObject.match.regEx);
      let matchedValue = targetValue.match(re);
      if (matchedValue) {
         // If RegEx match
         for (let variable of actionObject.match.variables) {
            sessionStorage.setItem(variable.storeAs, matchedValue[variable.matchGroup ? variable.matchGroup : 0]);
            console.log("DEBUG:", matchedValue[variable.matchGroup ? variable.matchGroup : 0], "store as", variable.storeAs);
         }
      }
   }
};

const getStringFromObject = (obj, path) => {
   let result = obj;
   for (let attr of path.split(".")) {
      result = result[attr];
   }
   return result.toString();
};

const replaceStrWithParams = (text) => {
   console.log("DEBUG - replacing params", text);
   let regex = /\{\{[A-Za-z_-]+[A-Za-z_0-9-]*\}\}/g;
   // if text is undefined or null return as it is.
   if (!text) return text;
   //
   if (typeof text === "string") {
      let match = text.match(regex);
      if (match) {
         for (let varname of match) {
            let stripedVarname = varname.replace(/[{}]/g, "");
            let replacedText = text.replace(varname, sessionStorage.getItem(stripedVarname));
            console.log("DEBUG - params replaced", replacedText);
            return replacedText;
         }
      }
   } else if (typeof text === "object") {
      let strText = JSON.stringify(text);
      let match = strText.match(regex);
      if (match) {
         for (let varname of match) {
            let stripedVarname = varname.replace(/[{}]/g, "");
            let replacedText = strText.replace(varname, sessionStorage.getItem(stripedVarname));
            console.log("DEBUG - params replaced", replacedText);
            return JSON.parse(replacedText);
         }
      }
   }
   // return original one if not match
   return text;
};

export const normalRequest = (actionObject, endpoints) => {
   let config = {
      baseURL: actionObject.baseURL ? actionObject.baseURL : endpoints[actionObject.useEndpoint].baseURL,
      headers: actionObject.headers ? replaceStrWithParams(actionObject.headers) : replaceStrWithParams(endpoints[actionObject.useEndpoint].headers),
      url: replaceStrWithParams(actionObject.url),
      method: actionObject.method,
      data: replaceStrWithParams(actionObject.data),
   };
   // if username/password was set, overwrite Auth
   if (endpoints[actionObject.useEndpoint].username && endpoints[actionObject.useEndpoint].password) {
      config.headers.Authorization =
         "Basic " + btoa(`${endpoints[actionObject.useEndpoint].username}:${endpoints[actionObject.useEndpoint].password}`);
   }
   console.log("action", actionObject);
   console.log("axiosConfig", config);

   return new Promise(async (resolve, reject) => {
      try {
         const response = await axios(config);
         console.log("DEBUG - response from normalRequest", response);
         // process Match response if configured
         processMatchResponse(actionObject, response);
         // if expect has any condition, we shall validate them before assume a success: true state
         if (actionObject.expect && !validateExpect(actionObject.expect, response)) {
            console.log("DEBUG - conditions haven't been met", actionObject.expect);
            reject({ ...response, success: false });
         }
         resolve({ ...response, success: true });
      } catch (e) {
         console.log("REQUEST ERROR - ", e);
         if (e.response) {
            if (actionObject.expect && validateExpect(actionObject.expect, e.response)) {
               // special case to handle 404 exception (which may be acceptable) - TBA any other case?
               e.response.success = true;
               console.log("DEBUG - Criteria hit on 404 which is accepted");
               resolve(e.response);
            } else {
               reject({ ...e.response, success: false });
            }
         } else {
            reject({ status: "Error", statusText: "connect ECONNREFUSED", success: false });
         }
      }
   });
};

export const pollingRequest = (actionObject, endpoints) => {
   let interval = actionObject.interval ? parseInt(actionObject.interval) : 5000;
   let maxRetry = actionObject.maxRetry ? parseInt(actionObject.maxRetry) : 10;
   let config = {
      baseURL: actionObject.baseURL ? actionObject.baseURL : endpoints[actionObject.useEndpoint].baseURL,
      headers: actionObject.headers ? replaceStrWithParams(actionObject.headers) : replaceStrWithParams(endpoints[actionObject.useEndpoint].headers),
      url: replaceStrWithParams(actionObject.url),
      method: actionObject.method,
      data: replaceStrWithParams(actionObject.data),
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
            if (counterFlag <= maxRetry) {
               response = await axios(config);
               console.log("polling", counterFlag, response, actionObject.expect);
               // if expect has any condition, we shall validate them before assume a success: true state
               if (actionObject.expect && validateExpect(actionObject.expect, response)) {
                  console.log("INFO - Resolved and testing condition have been met", actionObject.expect);
                  clearInterval(timer);
                  resolve({ ...response, success: true });
               }
            } else {
               clearInterval(timer);
               if (actionObject.expect) {
                  // this case mean runtime exceed maxRetry and expect was set and it still not hit the criteria
                  reject({ status: "Error Timeout - ", statusText: "Criteria was not meet in the proposed polling time", success: false });
               } else {
                  // this case mean runtime exceed maxRetry and expect not set
                  // we will assume that it success. in case user want to polling for a specific time and dont expect anything in response.
                  resolve({ ...response, success: true });
               }
            }
         } catch (e) {
            console.log("REQUEST ERROR - ", e);
            // By default AXIOS assumes a 404 as an issue but we need validation where 404 is an expected
            // or acceptable value.
            // if 404 is returned as a code, check if it is acceptable as condition, if it is:
            // - set the special case flag e.response.success to true;
            // resolve the promise sucessfully
            if (actionObject.expect && validateExpect(actionObject.expect, e.response)) {
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

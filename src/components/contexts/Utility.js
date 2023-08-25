export const getStringFromObject = (obj, path) => {
   let result = obj;
   try {
      if (!path) return JSON.stringify(result, null, 3);
      for (let attr of path.split(".")) {
         result = result[attr];
      }
      return JSON.stringify(result, null, 3);
   } catch (e) {
      console.log(e);
      return `Cannot find value in path ${path}`;
   }
};

export const getVariableDetails = (request) => {
   let varDetails = [];
   // when user set a variable with regex expression
   // the value of the set variable will be coming from the response
   // and will be stored and used in succeding request
   let varKeyToMatch = (request.match || request.match !== undefined) && `${request.match.storeAs}`;
   if (varKeyToMatch) {
      // get variable value from session storage
      const val = window.sessionStorage.getItem(varKeyToMatch);
      if (val || val !== null || val !== undefined) varDetails.push({ key: varKeyToMatch, val });
   }

   // when user used the variable as params in url i.e "{{}}"
   // to be used in the API request
   // value will be coming from the previous response
   let variableKeyAsParam = request.url.split("/").find((e) => e.includes("{{"));
   if (variableKeyAsParam || variableKeyAsParam !== undefined) {
      const val = window.sessionStorage.getItem(variableKeyAsParam.replace(/[^a-zA-Z ]/g, ""));
      if (val || val !== null || val !== undefined) varDetails.push({ key: variableKeyAsParam, val });
   }

   return varDetails;
};

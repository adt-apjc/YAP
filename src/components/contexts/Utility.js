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
   // A YAP variable may come from a storeAs statement, a URL and potentially a body statement

   const variables = new Set(); // using set to avoid to duplicate the variable string in the returned array of objects

   // when user set a variable with regex expression the value of the set variable will be coming from the response
   // and will be stored and used in succeding request

   if ((request.match || request.match !== undefined) && `${request.match.storeAs}`) variables.add(request.match.storeAs);

   // when user used the variable as params in url i.e "{{}}" to be used in the API request
   // value will be coming from the previous response

   const regexp = /{{\w+[0-9A-Za-z]+}}/g;

   const variablesInUrl = request.url.match(regexp) || [];
   for (const item of variablesInUrl) {
      variables.add(item.slice(2, item.length - 2));
   }

   // Considering use case where the variable is in the request body

   const variablesInRequestBody = !request.data ? [] : JSON.stringify(request.data).match(regexp) || [];
   for (const item of variablesInRequestBody) {
      variables.add(item.slice(2, item.length - 2));
   }

   // Finally converting the set of variables in an array of object, adding the variable value
   let varDetails = [];
   for (const variable of variables) {
      varDetails.push({ key: variable, val: window.sessionStorage.getItem(variable) });
   }

   return varDetails;
};

export const checkStaticVarIfUsed = (varDetails, staticVariables) => {
   let isUsed = false;

   for (let item of varDetails) {
      if (staticVariables && Object.keys(staticVariables).includes(item.key)) {
         isUsed = true;
         break;
      }
   }

   return isUsed;
};

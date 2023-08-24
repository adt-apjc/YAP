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

export const getVariableDetails = (request, variableLookup) => {
   let varDetails = [];
   // extract the variable used in request
   let variableKeyAsParam = request.url.split("/").find((e) => e.includes("{{"));

   if (variableKeyAsParam && Object.keys(variableLookup).length > 0)
      varDetails.push({ key: [variableKeyAsParam], val: variableLookup[variableKeyAsParam] });

   let varKeyFromResponse = (request.match || request.match !== undefined) && `${request.match.storeAs}`;
   if (varKeyFromResponse && Object.keys(variableLookup).length > 0 && variableLookup[`{{${varKeyFromResponse}}}`])
      varDetails.push({ key: [varKeyFromResponse], val: variableLookup[`{{${varKeyFromResponse}}}`] });

   return varDetails;
};

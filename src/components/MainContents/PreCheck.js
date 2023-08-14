import React from "react";

const PreCheck = (props) => {
   if (!props.show) return null;

   return (
      <div className="container">
         <div className="shadow-sm p-3 mb-3 bg-light text-secondary rounded pointer">No API request configured.</div>
      </div>
   );
};

export default PreCheck;

import React, { useEffect, useState } from "react";
import { VariableFormProps } from "./EditAction";

const VariableForm = (props: VariableFormProps) => {
   const [isEnable, setIsEnable] = useState(false);

   const handleExpectEnableChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setIsEnable(e.target.checked);
      if (!e.target.checked) props.setMatch(undefined);
      else props.setMatch({ regEx: ".*", matchGroup: "0", storeAs: "", objectPath: "" });
   };

   useEffect(() => {
      if (props.match) setIsEnable(true);
   }, [props.match]);

   useEffect(() => {
      if (props.input.displayResponseAs === "text") {
         if (props.match) props.setMatch({ regEx: ".*", matchGroup: "0", storeAs: props.match.storeAs, objectPath: "" });
      } // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [props.input.displayResponseAs]);

   return (
      <>
         <div className="form-check">
            <input
               type="checkbox"
               className="form-check-input"
               id="enableVarCheckBox"
               checked={isEnable}
               onChange={handleExpectEnableChange}
            />
            <label className="form-check-label" htmlFor="enableVarCheckBox">
               Variable
            </label>
         </div>
         {isEnable ? (
            <div className="row mb-2">
               <div className="col-md-3">
                  <small className="mb-1">Object path</small>
                  <input
                     className="form-control form-control-sm"
                     type="text"
                     name="objectPath"
                     required={props.input.type !== "ssh-cli" && props.input.payloadType === "text" ? false : true}
                     value={props.match ? props.match.objectPath : ""}
                     onChange={(e) => props.setMatch({ ...props.match!, [e.target.name]: e.target.value })}
                     disabled={props.input.displayResponseAs === "text"}
                  />
               </div>
               <div className="col-md-3">
                  <small className="mb-1">RegEx.</small>
                  <input
                     className="form-control form-control-sm"
                     type="text"
                     name="regEx"
                     required
                     value={props.match ? props.match.regEx : ""}
                     onChange={(e) => props.setMatch({ ...props.match!, [e.target.name]: e.target.value })}
                  />
               </div>
               <div className="col-md-3">
                  <small className="mb-1">Variable name</small>
                  <input
                     className="form-control form-control-sm"
                     type="text"
                     name="storeAs"
                     required
                     value={props.match ? props.match.storeAs : ""}
                     onChange={(e) => props.setMatch({ ...props.match!, [e.target.name]: e.target.value })}
                  />
               </div>
               <div className="col-md-3">
                  <small className="mb-1">Match group</small>
                  <input
                     className="form-control form-control-sm"
                     type="number"
                     name="matchGroup"
                     required
                     value={props.match ? props.match.matchGroup : 0}
                     onChange={(e) => props.setMatch({ ...props.match!, [e.target.name]: parseInt(e.target.value) })}
                  />
               </div>
            </div>
         ) : null}
      </>
   );
};

export default VariableForm;

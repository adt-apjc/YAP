import React, { useEffect, useState } from "react";
import { ExpectFormProps } from "./EditAction";
import _ from "lodash";

const ExpectForm = (props: ExpectFormProps) => {
   const [isExpectEnable, setIsExpectEnable] = useState(false);

   const handleExpectTypeChange = (e: React.ChangeEvent<HTMLSelectElement>, index: number) => {
      let currentExpect = _.cloneDeep(props.expect);
      currentExpect[index].type = e.target.value;
      currentExpect[index].value = e.target.value === "codeIs" ? [] : "";
      props.setExpect(currentExpect);
   };

   const handleExpectValueChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
      let currentExpect = _.cloneDeep(props.expect);
      currentExpect[index].value =
         currentExpect[index].type === "codeIs" ? e.target.value.split(",").map((el) => el.trim()) : e.target.value;
      props.setExpect(currentExpect);
   };

   const handleExpectEnableChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.checked) props.setExpect([]);
      setIsExpectEnable(e.target.checked);
   };

   const handleExpectFormDelete = (index: number) => {
      const newExpectList = props.expect.filter((el, i) => i !== index);
      props.setExpect(newExpectList);
   };

   const renderExpectForm = () => {
      return (
         props.expect &&
         props.expect.map((el, index) => {
            return (
               <div key={index} className="row mb-2">
                  <div className="col-3">
                     <select
                        className="form-select form-select-sm"
                        name="type"
                        value={props.expect[index].type}
                        onChange={(e) => handleExpectTypeChange(e, index)}
                     >
                        <option value="bodyContain">bodyContain</option>
                        <option value="bodyNotContain">bodyNotContain</option>
                        <option value="codeIs">HttpResponseCodeIs</option>
                     </select>
                  </div>
                  <div className="col-7">
                     <input
                        className="form-control form-control-sm"
                        type="text"
                        name="value"
                        required
                        value={props.expect[index].value}
                        onChange={(e) => handleExpectValueChange(e, index)}
                     />
                  </div>
                  <div className="col-2">
                     <i
                        className="fal fa-times text-danger icon-hover-highlight pointer"
                        onClick={() => handleExpectFormDelete(index)}
                     />
                  </div>
               </div>
            );
         })
      );
   };

   useEffect(() => {
      if (props.expect && props.expect.length > 0) setIsExpectEnable(true);
   }, [props.expect]);

   return (
      <>
         <div className="form-check">
            <input
               type="checkbox"
               className="form-check-input"
               id="enableExpectCheckBox"
               checked={isExpectEnable}
               onChange={handleExpectEnableChange}
            />
            <label className="form-check-label" htmlFor="enableExpectCheckBox">
               Enable expect
            </label>
         </div>
         {isExpectEnable ? (
            <div>
               {renderExpectForm()}
               <div className="w-100 text-center">
                  <i
                     className="fad fa-plus text-info icon-hover-highlight pointer"
                     onClick={() => props.setExpect([...props.expect, { type: "bodyContain", value: "" }])}
                  />
               </div>
            </div>
         ) : null}
      </>
   );
};

export default ExpectForm;

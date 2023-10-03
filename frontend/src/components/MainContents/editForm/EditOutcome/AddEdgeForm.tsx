import React, { useEffect, useState } from "react";

import { AddEdgeFormProps } from "./EditOutcomeTypes";

const AddEdgeForm = (props: AddEdgeFormProps) => {
   const [input, setInput] = useState({
      id: "",
      source: "",
      target: "",
      label: "",
      highlight: false,
      dashed: false,
      curveline: false,
   });

   const clearInputbox = () => {
      setInput({ id: "", source: "", target: "", label: "", highlight: false, dashed: false, curveline: false });
   };

   const renderNodeSelectOption = () => {
      if (!props.nodeList) return;

      return props.nodeList.map((el, index) => {
         return (
            <option key={index} value={el.data.id}>
               {el.data.label}
            </option>
         );
      });
   };

   const handleAddEdge = (e: React.FormEvent) => {
      e.preventDefault();
      let uuid = Math.abs((Math.random() * 0xffffffff) | 0).toString(16);
      let edgeObject = {
         data: {
            id: input.id ? input.id : uuid,
            source: input.source,
            target: input.target,
            label: input.label !== null ? input.label : "",
         },
         classes: `${input.highlight ? "highlight" : ""} ${input.curveline ? "curve-multiple" : ""} ${
            input.dashed ? "dashed" : ""
         }`,
      };
      props.onAddElement(edgeObject);
      clearInputbox();
   };

   const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) =>
      setInput((prev) => ({ ...prev, [e.target.name]: e.target.value }));
   const handleInputCheck = (e: React.ChangeEvent<HTMLInputElement>) =>
      setInput((prev) => ({ ...prev, [e.target.name]: e.target.checked }));

   useEffect(() => {
      let { initValue } = props;
      if (!initValue) {
         clearInputbox();
      } else
         setInput({
            id: initValue.data.id,
            source: initValue.data.source,
            target: initValue.data.target,
            label: initValue.data.label || "",
            highlight: initValue.classes.includes("highlight"),
            dashed: initValue.classes.includes("dashed"),
            curveline: initValue.classes.includes("curve-multiple"),
         });
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [JSON.stringify(props.initValue)]);

   return (
      <form onSubmit={handleAddEdge}>
         <div className="form-group">
            <div className="row">
               <div className="col-sm-3">
                  <label>Source</label>
                  <select
                     className="form-select form-select-sm"
                     required
                     name="source"
                     value={input.source}
                     onChange={handleInputChange}
                  >
                     <option value="">Choose...</option>
                     {renderNodeSelectOption()}
                  </select>
               </div>
               <div className="col-sm-3">
                  <label>Target</label>
                  <select
                     className="form-select form-select-sm"
                     required
                     name="target"
                     value={input.target}
                     onChange={handleInputChange}
                  >
                     <option value="">Choose...</option>
                     {renderNodeSelectOption()}
                  </select>
               </div>
               <div className="col-sm-3">
                  <label>Label (optional)</label>
                  <input
                     type="text"
                     className="form-control form-control-sm"
                     placeholder="label"
                     name="label"
                     value={input.label}
                     onChange={handleInputChange}
                  />
               </div>
               <div className="col-sm-2 ms-3">
                  <label>Appearance</label>
                  <div className="form-check">
                     <input
                        className="form-check-input"
                        type="checkbox"
                        id="highlight-checkbox"
                        name="highlight"
                        checked={input.highlight}
                        onChange={handleInputCheck}
                     />
                     <label className="form-check-label" htmlFor="highlight-checkbox">
                        Highlight
                     </label>
                  </div>
                  <div className="form-check">
                     <input
                        className="form-check-input"
                        type="checkbox"
                        id="dashed-checkbox"
                        name="dashed"
                        checked={input.dashed}
                        onChange={handleInputCheck}
                     />
                     <label className="form-check-label" htmlFor="dashed-checkbox">
                        Dashed
                     </label>
                  </div>
                  <div className="form-check">
                     <input
                        className="form-check-input"
                        type="checkbox"
                        id="curve-line-checkbox"
                        name="curveline"
                        checked={input.curveline}
                        onChange={handleInputCheck}
                     />
                     <label className="form-check-label" htmlFor="curve-line-checkbox">
                        Curve line
                     </label>
                  </div>
               </div>
            </div>
         </div>
         <button type="submit" className="btn btn-sm btn-primary my-1">
            {props.initValue ? "Update" : "Add"}
         </button>
      </form>
   );
};

export default AddEdgeForm;

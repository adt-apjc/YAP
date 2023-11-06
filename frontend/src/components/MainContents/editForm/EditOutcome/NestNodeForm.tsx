import { NestedNodeFormProps } from "./EditOutcomeTypes";

const NestedNodeForm = (props: NestedNodeFormProps) => {
   const renderNodeListOptions = () => {
      if (!props.nodeList) return;

      return props.nodeList.map((el, index) => {
         return (
            <option key={index} value={el.data.id}>
               {el.data.label}
            </option>
         );
      });
   };

   const renderBody = () => {
      return (
         <div className="px-4 py-2 border-top">
            <div className="col-lg-6 col-sm-12">
               <label>
                  <span className="me-3">Parent node</span>
                  <span className="font-sm fw-light fst-italic">
                     *For best rendering, you should use the Default icon node as a parent.
                  </span>
               </label>
               <select className="form-select form-select-sm" name="parent" value={props.parent} onChange={props.onParentChange}>
                  <option value="">Ungroup</option>
                  {renderNodeListOptions()}
               </select>
            </div>
         </div>
      );
   };

   return (
      <div className="bg-light rounded-lg mb-1">
         <div className="d-flex justify-content-between">
            <div className="px-2 py-1">Compound node</div>
            <div className="px-2 py-1">
               <input
                  className="form-check-input"
                  type="checkbox"
                  title="enable compound node"
                  name="enableCompoundNode"
                  checked={props.enableNested}
                  onChange={() => props.setEnableNested((prev) => !prev)}
               />
            </div>
         </div>
         {props.enableNested && renderBody()}
      </div>
   );
};

export default NestedNodeForm;

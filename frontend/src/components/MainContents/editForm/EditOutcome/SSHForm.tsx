import React from "react";

import { AddSSHInfoFormProps } from "./EditOutcomeTypes";

const AddSSHInfoForm = (props: AddSSHInfoFormProps) => {
   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      props.setSSHinfo((prev) => ({ ...prev, [e.target.name]: e.target.value }));
   };

   return (
      <div className="bg-light rounded-lg mb-1">
         <div className="d-flex justify-content-between">
            <div className="px-2 py-1">SSH</div>
            <div className="px-2 py-1">
               <input
                  className="form-check-input"
                  type="checkbox"
                  title="enable command"
                  name="enableCommand"
                  checked={props.enableSSH}
                  onChange={() => props.setEnableSSH((prev) => !prev)}
               />
            </div>
         </div>
         {props.enableSSH && (
            <div className="px-4 py-2 border-top">
               <div className="row">
                  <div className="col-sm-12 col-md-4">
                     <label>Hostname</label>
                     <div className="row">
                        <div className="col-9">
                           <input
                              required
                              className="form-control form-control-sm"
                              type="text"
                              name="hostname"
                              value={props.sshInfo.hostname}
                              onChange={handleInputChange}
                           />
                        </div>
                        <div className="col-3 position-relative form-port-number">
                           <input
                              required
                              className="form-control form-control-sm"
                              type="number"
                              name="port"
                              value={props.sshInfo.port}
                              onChange={handleInputChange}
                           />
                        </div>
                     </div>
                  </div>

                  <div className="col-sm-12 col-md-4">
                     <label>Username</label>
                     <input
                        required
                        className="form-control form-control-sm"
                        type="text"
                        name="username"
                        value={props.sshInfo.username}
                        onChange={handleInputChange}
                     />
                  </div>
                  <div className="col-sm-12 col-md-4">
                     <label>Password</label>
                     <input
                        required
                        className="form-control form-control-sm"
                        type="text"
                        name="password"
                        value={props.sshInfo.password}
                        onChange={handleInputChange}
                     />
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default AddSSHInfoForm;

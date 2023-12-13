import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useGlobalContext } from "../contexts/ContextProvider";

type CatalogModalProps = {
   onHide: () => void;
   params: any;
};

const CatalogModal = (props: CatalogModalProps) => {
   const navigate = useNavigate();
   const [isDeploying, setIsDeploying] = useState(false);
   const [isFailing, setisFailing] = useState(false);
   const { dispatch } = useGlobalContext();

   const handleDeploy = async () => {
      try {
         setIsDeploying(true);
         setisFailing(false);
         let config = {
            baseURL: props.params.path,
            method: "GET",
            timeout: 5000, // 5 seconds timeout
         };

         let response = await axios.post(`${process.env.REACT_APP_API_URL!.replace(/\/+$/, "")}/proxy/request`, { ...config });
         // load config context
         dispatch({ type: "loadConfig", payload: response.data });
         setIsDeploying(false);
         navigate("/demo");
      } catch (e) {
         setIsDeploying(false);
         setisFailing(true);
         console.log(e);
      }
   };

   return (
      <>
         <div className="modal-body">
            <div className="h-100 ">
               <div className="d-block">
                  <div className="d-flex flex-column align-items-center  justify-content-center">
                     <div className="circle-icon" style={{ padding: `${props.params.iconPath ? "" : "12px 6px"}` }}>
                        {props.params.iconPath ? (
                           <img src={`${props.params.iconPath}`} alt={`${props.params.name}`} className="custom-icon" />
                        ) : (
                           <i className="far fa-chart-network" />
                        )}
                     </div>
                     <h4 className="p-0 m-0 text-center">{props.params.name}</h4>
                     <small className="text-muted ">{props.params.version}</small>
                     <div className="p-5">
                        <ReactMarkdown
                           children={props.params.description}
                           // @ts-ignore
                           rehypePlugins={[rehypeRaw]}
                        />
                        {props.params.useCases && (
                           <>
                              <h5 className="p-0 m-0 text-left">Use Cases</h5>
                              <ReactMarkdown
                                 children={props.params.useCases}
                                 // @ts-ignore
                                 rehypePlugins={[rehypeRaw]}
                              />
                           </>
                        )}
                        {props.params.requirements && (
                           <>
                              <h5 className="p-0 m-0 text-left">Requirements</h5>
                              <ReactMarkdown
                                 children={props.params.requirements}
                                 // @ts-ignore
                                 rehypePlugins={[rehypeRaw]}
                              />
                           </>
                        )}
                     </div>
                  </div>
               </div>
            </div>
         </div>
         <div className="modal-footer p-1">
            {isFailing && (
               <div aria-hidden="true" style={{ color: "#CE2029" }}>
                  <i className="far fa-exclamation-triangle me-2" />
                  Failing to load the demo configuration
               </div>
            )}
            <button type="button" className="btn btn-sm" onClick={props.onHide}>
               Close
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={handleDeploy} disabled={isDeploying}>
               {isDeploying && <i className="me-2 far fa-spin fa-spinner" />}
               Deploy
            </button>
         </div>
      </>
   );
};

export default CatalogModal;

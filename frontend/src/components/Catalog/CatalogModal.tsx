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
   const { context, dispatch } = useGlobalContext();

   const handleDeploy = async () => {
      try {
         setIsDeploying(true);
         let config = {
            baseURL: props.params.path,
            method: "GET",
         };

         let response = await axios.post(`${process.env.REACT_APP_API_URL!.replace(/\/+$/, "")}/proxy/request`, { ...config });
         // load config context
         dispatch({ type: "loadConfig", payload: response.data });
         setIsDeploying(false);
         navigate("/demo");
      } catch (e) {
         setIsDeploying(false);
         console.log(e);
      }
   };

   return (
      <>
         <div className="modal-body">
            <div className="h-100 ">
               <div className="d-block">
                  <div className="d-flex flex-column align-items-center justify-content-center">
                     <div className="circle-icon" style={{ padding: `${props.params.iconPath ? "" : "12px 6px"}` }}>
                        {props.params.iconPath ? (
                           <img src={`${props.params.iconPath}`} alt={`${props.params.name}`} className="custom-icon" />
                        ) : (
                           <i className="far fa-chart-network" />
                        )}
                     </div>
                     <h5 className="p-0 m-0 text-center">{props.params.name}</h5>
                     <small className="text-muted ">{props.params.version}</small>
                     <div className="position-absolute " style={{ bottom: "2rem" }}>
                        <div className="d-flex flex-column justify-content-center align-items-center">
                           <div className="d-flex justify-content-center">
                              {props.params.labels.map((l: string) => {
                                 return (
                                    <span key={l} className="badge badge-sm bg-secondary me-2">
                                       {l}
                                    </span>
                                 );
                              })}
                           </div>
                        </div>
                     </div>
                  </div>
                  <div className="p-5">
                     <ReactMarkdown
                        children={props.params.description}
                        // @ts-ignore
                        rehypePlugins={[rehypeRaw]}
                     />
                  </div>
               </div>
            </div>
         </div>
         <div className="modal-footer p-1">
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

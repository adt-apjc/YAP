import ReactJson from "@uiw/react-json-view";
import { useGlobalContext } from "../../contexts/ContextProvider";
import WithInfoPopup from "../../Popper/InfoPopper";
import { getStringFromObject, getVariableDetails, checkStaticVarIfUsed } from "../../contexts/Utility";
import { RestActionConfig } from "../../contexts/ContextTypes";
import { APIResponse } from "../../../helper/apiAction";

type RestResponseDetailProps = {
   show: boolean;
   request: RestActionConfig;
   response: APIResponse | null;
};

const RestResponseDetails = (props: RestResponseDetailProps) => {
   const { context } = useGlobalContext();
   let responseViewer;
   let responseStatus = props.response ? `${props.response.status} ${props.response.statusText}` : "";
   let statusText = props.response && props.response.statusText ? props.response.statusText : "";
   let payloadViewer =
      props.request && props.request.data ? (
         <div className="p-2">
            payload
            {props.request.payloadType === "text" ? (
               <pre>{typeof props.request.data === "string" ? props.request.data : JSON.stringify(props.request.data)}</pre>
            ) : (
               <ReactJson value={props.request.data} collapsed={4} />
            )}
         </div>
      ) : null;

   if (props.request && props.request.displayResponseAs === "text") {
      responseViewer = props.response ? (
         <pre className="p-2">{getStringFromObject(props.response.data, props.request.objectPath)}</pre>
      ) : null;
   } else {
      // default display response as JSON
      responseViewer = props.response ? (
         <ReactJson value={typeof props.response.data === "object" ? props.response.data : {}} collapsed={1} />
      ) : null;
   }

   const getHeaderColor = (method: string) => {
      let mapper = { get: "primary", post: "success", put: "info", patch: "warning", delete: "danger" };
      if (method in mapper) return mapper[method as keyof typeof mapper];
      else return "primary";
   };

   const renderVariableDetails = () => {
      const variableDetails = getVariableDetails(props.request);
      return (
         <>
            {variableDetails.length > 0 && (
               <WithInfoPopup
                  PopperComponent={
                     <div className="d-flex flex-column p-2 text-dark" style={{ maxWidth: "800px" }}>
                        {context.config.staticVariables && Object.keys(context.config.staticVariables).length > 0 && (
                           <>
                              {checkStaticVarIfUsed(variableDetails, context.config.staticVariables) && (
                                 <>
                                    <div className="mb-2">
                                       <small className="badge rounded-pill  text-bg-light">Static Variables</small>
                                    </div>
                                    {Object.keys(context.config.staticVariables).map((item, i) => {
                                       if (variableDetails.find((el) => el.key === item))
                                          return (
                                             <div className="d-flex" key={i}>
                                                <small className="me-3" style={{ minWidth: "90px" }}>
                                                   {item}:
                                                </small>
                                                <small>{context.config.staticVariables![item]}</small>
                                             </div>
                                          );
                                       return null;
                                    })}
                                    <hr className="my-2" />
                                 </>
                              )}
                           </>
                        )}

                        {variableDetails.map((item, i) => {
                           if (!Object.keys(context.config.staticVariables || {}).includes(item.key))
                              return (
                                 <div className="d-flex" key={i}>
                                    <small className="me-3" style={{ minWidth: "90px" }}>
                                       {item.key}:
                                    </small>
                                    <small className="text-break">{item.val}</small>
                                 </div>
                              );
                           return null;
                        })}
                     </div>
                  }
                  placement="left"
               >
                  <div className="badge text-bg-secondary">Variables</div>
               </WithInfoPopup>
            )}
         </>
      );
   };

   if (!props.show) return null;
   return (
      <div className="container position-relative bg-light pt-2 pb-3" style={{ top: "-15px" }}>
         <div className="p-2">{props.request ? props.request.description : ""}</div>
         <div className="d-flex justify-content-between p-2 mb-2">
            <div>
               Endpoint{" "}
               {props.request.useEndpoint ? (
                  <WithInfoPopup
                     PopperComponent={
                        <div className="d-flex p-2 text-dark" style={{ maxWidth: "800px" }}>
                           <small>{`${
                              context.config.endpoints[props.request.useEndpoint] &&
                              context.config.endpoints[props.request.useEndpoint].baseURL
                                 ? context.config.endpoints[props.request.useEndpoint].baseURL
                                 : "baseURL not configured"
                           }`}</small>
                        </div>
                     }
                     placement="right"
                  >
                     <span className="fw-light bg-secondary text-light p-1 ms-4 rounded">{props.request.useEndpoint}</span>
                  </WithInfoPopup>
               ) : (
                  <span className="fw-light bg-secondary text-light p-1 ms-4 rounded">Not Configured</span>
               )}
            </div>
            <div className="d-flex justify-content-between">
               {/* Polling */}
               <div className="me-2">
                  {props.request.type === "polling" && (
                     <WithInfoPopup
                        PopperComponent={
                           <div className="d-flex flex-column p-2  text-dark" style={{ maxWidth: "800px" }}>
                              <div className="d-flex">
                                 <small className="me-3" style={{ minWidth: "100px" }}>
                                    Max Retry:{" "}
                                 </small>
                                 <small>{props.request.maxRetry}</small>
                              </div>
                              <div className="d-flex">
                                 <small className="me-3" style={{ minWidth: "100px" }}>
                                    Interval:{" "}
                                 </small>
                                 <small>{props.request.interval}</small>
                              </div>
                           </div>
                        }
                        placement="left"
                     >
                        <div className="badge text-bg-secondary">Polling</div>
                     </WithInfoPopup>
                  )}
               </div>
               {/* Variable */}
               <div className="me-2">{renderVariableDetails()}</div>
               {/* Expect */}
               <div>
                  {props.request.expect && props.request.expect.length > 0 && (
                     <WithInfoPopup
                        PopperComponent={
                           <div className="d-flex flex-column p-2 text-dark" style={{ maxWidth: "800px" }}>
                              {props.request.expect.map((item, i) => {
                                 let type = item.type;
                                 if (item.type === "codeIs") type = "responseCodeIs";

                                 return (
                                    <div className="d-flex" key={i}>
                                       <small className="me-3" style={{ minWidth: "100px" }}>
                                          {type}:{" "}
                                       </small>
                                       <small>{`${item.type === "codeIs" ? `${item.value.join(", ")}` : `${item.value}`}`}</small>
                                    </div>
                                 );
                              })}
                           </div>
                        }
                        placement="left"
                     >
                        <div className="badge text-bg-secondary">Expect</div>
                     </WithInfoPopup>
                  )}
               </div>
            </div>
         </div>
         <div className="bg-white p-2 rounded shadow-sm mb-2">
            <div className="d-flex">
               <div className={`me-3 fw-bolder text-${getHeaderColor(props.request.method)}`}>
                  {props.request.method.toUpperCase()}
               </div>
               <div className="text-dark">{props.request.url}</div>
            </div>
            {payloadViewer}
         </div>
         <div className="bg-white p-2 rounded shadow-sm">
            <div className="d-flex justify-content-between">
               Response
               <div className="fw-light" style={{ fontSize: "12px" }}>
                  {responseStatus} {statusText && `- ${statusText}`}
               </div>
            </div>
            {responseViewer}
         </div>
      </div>
   );
};

export default RestResponseDetails;

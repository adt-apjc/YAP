import { useGlobalContext } from "../../contexts/ContextProvider";
import WithInfoPopup from "../../Popper/InfoPopper";
import { getVariableDetails, checkStaticVarIfUsed } from "../../contexts/Utility";
import { SSHActionConfig } from "../../contexts/ContextTypes";
import { SSHCLIResponse } from "../../../helper/apiAction";
import { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { useDidUpdateEffect } from "../../contexts/CustomHooks";

type CommandResponseDetailProps = {
   show: boolean;
   request: SSHActionConfig;
   response: SSHCLIResponse | null;
};

const CommandResponseDetails = (props: CommandResponseDetailProps) => {
   const { context } = useGlobalContext();
   const fitAddon = useRef(new FitAddon()).current;
   const terminal = useRef<Terminal>(
      new Terminal({
         convertEol: true,
         fontFamily: `'Fira Mono', monospace`,
         fontSize: 15,
         disableStdin: true,
         cursorBlink: false,
         cursorInactiveStyle: "none",
         theme: {
            foreground: "#3e3e3e",
            background: "#ffffff",
            cursor: "#3f3f3f",
            black: "#3e3e3e",
            brightBlack: "#666666",
            red: "#970b16",
            brightRed: "#de0000",
            green: "#07962a",
            brightGreen: "#87d5a2",
            yellow: "#f8eec7",
            brightYellow: "#f1d007",
            blue: "#003e8a",
            brightBlue: "#2e6cba",
            magenta: "#e94691",
            brightMagenta: "#ffa29f",
            cyan: "#89d1ec",
            brightCyan: "#1cfafe",
            white: "#ffffff",
            brightWhite: "#ffffff",
            selectionBackground: "#BEBFC5",
         },
      }),
   ).current;

   let uuid = useRef(Math.random().toString(36).substring(2, 15));
   let failureCause = props.response && props.response.failureCause ? props.response.failureCause : "";

   const handleCopyToClipboard = () => {
      if (!props.response) return;
      terminal.selectAll();
      navigator.clipboard.writeText(terminal.getSelection());
      terminal.clearSelection();
   };

   let responseViewer =
      props.response && props.response.response ? (
         <>
            <div className="position-absolute xterm-copy-clipboard">
               <i
                  className="fal fa-copy pointer icon-hover-highlight"
                  title="Copy to clipboard"
                  onClick={handleCopyToClipboard}
               />
            </div>
            <div id={`xterm-${uuid.current}`} className="w-100" style={{ height: 500 }}></div>
         </>
      ) : null;

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

   useDidUpdateEffect(() => {
      if (!props.response) return;
      if (!props.response.response) return;
      if (!props.show) return;

      terminal.open(document.getElementById(`xterm-${uuid.current}`)!);
      terminal.clear();
      terminal.loadAddon(fitAddon);
      fitAddon.fit();
      terminal.write(props.response.response);
   }, [props.response, props.show]);

   useEffect(() => {
      const handleResize = () => {
         fitAddon.fit();
      };
      window.addEventListener("resize", handleResize);
      return () => {
         window.removeEventListener("resize", handleResize);
      };
   }, []);

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
                              context.config.sshCliEndpoints[props.request.useEndpoint] &&
                              context.config.sshCliEndpoints[props.request.useEndpoint].hostname
                                 ? context.config.sshCliEndpoints[props.request.useEndpoint].hostname
                                 : "Application error: Endpoint IP or Address not found" // endpoint ip or address is a manadadory field
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

                                 return (
                                    <div className="d-flex" key={i}>
                                       <small className="me-3" style={{ minWidth: "100px" }}>
                                          {type}:{" "}
                                       </small>
                                       <small>{item.value}</small>
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
         {/* <div className="bg-white p-2 rounded shadow-sm mb-2">{payloadViewer}</div> */}
         <div className="bg-white p-2 rounded shadow-sm mb-2">
            Commands
            <pre className="p-2">{props.request.data}</pre>
         </div>
         <div className="bg-white p-2 rounded shadow-sm">
            <div className="d-flex justify-content-between">
               Response
               <div className="fw-light" style={{ fontSize: "12px" }}>
                  {failureCause && `- ${failureCause}`}
               </div>
            </div>
            <div className="position-relative">{responseViewer}</div>
         </div>
      </div>
   );
};

export default CommandResponseDetails;

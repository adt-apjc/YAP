import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Socket, io } from "socket.io-client";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { config } from "./contexts/ContextTypes";

const fitAddon = new FitAddon();

const SSHContainer = () => {
   const location = useLocation();
   const socketRef = useRef<Socket | null>(null);
   const [selectedCmd, setSelectedCmd] = useState("");

   const handleSendCommand = () => {
      if (!selectedCmd) return;
      socketRef.current?.emit("data", selectedCmd + "\r");
      setSelectedCmd("");
   };

   const renderCommandOptions = () => {
      return <option value="">Choose...</option>;
   };

   useEffect(() => {
      window.addEventListener("resize", () => {
         fitAddon.fit();
      });
   }, []);

   useEffect(() => {
      let queryParams = new URLSearchParams(location.search);
      let selectedElementId = queryParams.get("selectedElementId")!;
      let stepId = queryParams.get("stepId")!;
      const config: config = JSON.parse(window.localStorage.getItem("__internal__configData") as string);

      let { hostname, username, password, port } = config.mainContent[stepId].outcome![0].ssh![selectedElementId];

      if (!hostname || !username || !password) return;

      document.title = `SSH connection ${hostname}`;

      const socket = io(process.env.REACT_APP_API_URL!, {
         query: { hostname, username, password, port },
      });
      socketRef.current = socket;

      const terminal = new Terminal({
         convertEol: true,
         fontFamily: `'Fira Mono', monospace`,
         fontSize: 15,
         cursorBlink: true,
         theme: {
            background: "#212529",
         },
      });
      terminal.loadAddon(fitAddon);
      terminal.open(document.getElementById("xterm")!);
      terminal.clear();
      terminal.writeln(`Connecting to ${username}@${hostname}...`);
      fitAddon.fit();

      terminal.onData((e) => {
         socket.emit("data", e);
      });

      socket.on("data", function (data) {
         terminal.write(data);
      });

      socket.on("sshdisconnect", () => {
         window.close();
      });
   }, [location]);

   return (
      <div className="d-flex flex-column h-100">
         <div className="xterm-predefine-cmd px-2 pt-2 pb-3 bg-dark">
            <label className="text-light">Pre-defined commands</label>
            <div className="input-group input-group-sm">
               <select
                  className="form-select form-select-sm"
                  value={selectedCmd}
                  onChange={(e) => setSelectedCmd(e.target.value)}
               >
                  {renderCommandOptions()}
                  {/* TODO */}
                  {/* <option value={`config\nhostname test\nexit\nno\n`}>Config hostname</option>
                  <option value="show config commit change last 1">show last commit change</option> */}
               </select>
               <button className="btn btn-outline-light" type="button" onClick={handleSendCommand}>
                  Send
               </button>
            </div>
         </div>
         <div className="xterm-container bg-dark ps-2 py-2">
            <div id="xterm" className="h-100 w-100"></div>
         </div>
      </div>
   );
};

export default SSHContainer;

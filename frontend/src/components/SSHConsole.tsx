import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Socket, io } from "socket.io-client";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { config } from "./contexts/ContextTypes";
import { useDidUpdateEffect } from "./contexts/CustomHooks";

const fitAddon = new FitAddon();

const SSHContainer = () => {
   const location = useLocation();
   const socketRef = useRef<Socket | null>(null);
   const [commands, setCommands] = useState<{ label: string; command: string }[]>([]);
   const [selectedCmd, setSelectedCmd] = useState("");

   const handleSendCommand = () => {
      if (!selectedCmd) return;
      socketRef.current?.emit("data", selectedCmd + "\r");
      setSelectedCmd("");
   };

   const renderCommandOptions = () => {
      return commands.map((cmd, index) => {
         return (
            <option key={index} value={cmd.command}>
               {cmd.label}
            </option>
         );
      });
   };

   useEffect(() => {
      window.addEventListener("resize", () => {
         fitAddon.fit();
      });
   }, []);

   useDidUpdateEffect(() => {
      let queryParams = new URLSearchParams(location.search);
      let selectedElementId = queryParams.get("selectedElementId")!;
      let stepId = queryParams.get("stepId")!;
      const config: config = JSON.parse(window.localStorage.getItem("__internal__configData") as string);

      let { hostname, username, password, port, commands, sshkey } =
         config.mainContent[stepId].outcome![0].ssh![selectedElementId];
      if (commands) setCommands(commands);

      if (!hostname || !username || (!password && !sshkey)) return;

      document.title = `SSH connection ${hostname}`;

      const socket = io(process.env.REACT_APP_API_URL!, {
         query: { hostname, username, port, [sshkey ? "sshkey" : "password"]: sshkey ? sshkey : password },
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

      socket.on("sshconnect", function (data) {
         terminal.write(data);
      });

      socket.on("sshclose ", function (data) {
         terminal.write(data);
      });

      socket.on("ssherror", function (data) {
         terminal.write(data);
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
                  <option value="">Choose...</option>
                  {renderCommandOptions()}
               </select>
               <button className="btn btn-outline-light" type="button" onClick={handleSendCommand}>
                  Send
               </button>
            </div>
         </div>
         <div className="xterm-container bg-dark">
            <div id="xterm" className="h-100 w-100"></div>
         </div>
      </div>
   );
};

export default SSHContainer;

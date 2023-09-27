import React from "react";
import { HashRouter, Route, Routes, useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import SideBar from "./Sidebar/SideBar";
import MainContents from "./MainContents";
import { ContextProvider } from "./contexts/ContextProvider";
import NavigationBar from "./NavigationBar/NavigationBar";
//
import "./App.css";
import { useEffect } from "react";

const fitAddon = new FitAddon();

const Home = () => {
   return (
      <React.StrictMode>
         <NavigationBar />
         <SideBar />
         <div className="d-flex"></div>

         {/* main-content div will set the flag for 100% width and 100% height */}
         <div className="main-content">
            {/*
            Adjust this div if you want to change padding or margin of main-content, it will effect every page 
            */}

            <div className="h-100 w-100 pt-4 pb-4 d-flex">
               <MainContents />
            </div>
         </div>
      </React.StrictMode>
   );
};

const SSHContainer = () => {
   const location = useLocation();

   useEffect(() => {
      let queryParams = new URLSearchParams(location.search);
      let hostname = queryParams.get("hostname");
      let username = queryParams.get("username");
      let password = queryParams.get("password");

      if (!hostname || !username || !password) return;

      // document.title = `SSH connection ${hostname}`;
      document.title = `SSH connection`;
      window.addEventListener("resize", () => {
         fitAddon.fit();
      });

      const socket = io(process.env.REACT_APP_API_URL!, {
         query: { hostname, username, password },
      });
      const terminal = new Terminal({
         convertEol: true,
         fontFamily: `'Fira Mono', monospace`,
         fontSize: 15,
         cursorBlink: true,
      });
      terminal.loadAddon(fitAddon);

      terminal.open(document.getElementById("xterm")!);
      terminal.writeln(`Connecting...`);
      fitAddon.fit();

      terminal.onData((e) => {
         socket.emit("data", e);
      });

      socket.on("data", function (data) {
         console.log(data);
         terminal.write(data);
      });

      socket.on("sshdisconnect", () => {
         window.close();
      });
   }, [location]);

   return (
      <div className="xterm-container">
         <div id="xterm" className="h-100 w-100"></div>
      </div>
   );
};

const App = () => {
   document.title = "Workflow Demo";
   return (
      <ContextProvider>
         <HashRouter>
            <Routes>
               <Route path="/ssh" element={<SSHContainer />} />
               <Route path="/" element={<Home />} />
            </Routes>
         </HashRouter>
      </ContextProvider>
   );
};

export default App;

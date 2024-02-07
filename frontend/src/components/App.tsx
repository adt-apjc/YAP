import { useNavigate, HashRouter, Route, Routes, Navigate } from "react-router-dom";

import SideBar from "./Sidebar/SideBar";
import MainContents from "./MainContents";
import { ContextProvider } from "./contexts/ContextProvider";
import NavigationBar from "./NavigationBar/NavigationBar";
import SSHContainer from "./SSHConsole";
//
import "./App.css";
import { useEffect } from "react";
import Catalog from "./Catalog/Catalog";

const Home = () => {
   const navigate = useNavigate();
   useEffect(() => {
      const savedState = JSON.parse(window.localStorage.getItem("__internal__configData") as string);
      if (!savedState) {
         navigate("/");
      } // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   return (
      <>
         <NavigationBar />
         <SideBar />
         {/* main-content div will set the flag for 100% width and 100% height */}
         <div className="main-content">
            {/*
            Adjust this div if you want to change padding or margin of main-content, it will effect every page 
            */}

            <div className="h-100 w-100 overflow-auto">
               <MainContents />
            </div>
         </div>
      </>
   );
};

const App = () => {
   useEffect(() => {
      console.log("env:", process.env);
      document.title = "Workflow Demo";
   }, []);
   return (
      <ContextProvider>
         <HashRouter>
            <Routes>
               <Route path="/" element={<Catalog />} />
               <Route path="/demo" element={<Home />} />
               <Route path="/ssh" element={<SSHContainer />} />
               <Route path="*" element={<Navigate to="/" />} />
            </Routes>
         </HashRouter>
      </ContextProvider>
   );
};

export default App;

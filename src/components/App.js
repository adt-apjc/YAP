import React from "react";
import SideBar from "./Sidebar/SideBar";
import MainContents from "./MainContents";
import "./App.css";
//
import { ContextProvider } from "./contexts/ContextProvider";
import NavigationBar from "./NavigationBar/NavigationBar";

const App = () => {
   document.title = "Workflow Demo";
   return (
      <ContextProvider>
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
      </ContextProvider>
   );
};

export default App;

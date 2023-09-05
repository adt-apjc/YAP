import React, { useContext } from "react";
import Logo from "../MainContents/Logo";
import GlobalContext from "../contexts/ContextProvider";
import Actions from "./Actions";
import About from "./About";
import Settings from "./Settings";

const NavigationBar = () => {
   const context = useContext(GlobalContext);

   return (
      <div
         className="navbar"
         style={{
            backgroundColor: `${
               context.config.navbar && context.config.navbar.navBgColor ? `${context.config.navbar.navBgColor}` : ""
            }`,
            color: `${
               context.config.navbar && context.config.navbar.navFontColor ? `${context.config.navbar.navFontColor}` : ""
            }`,
         }}
      >
         {/* Right */}
         <Logo />

         {/* Left */}
         <div className="d-flex">
            {/* dropdown */}
            <Actions />
            <About />
            <Settings />
         </div>
      </div>
   );
};

export default NavigationBar;

import Logo from "./Logo";
import { useGlobalContext } from "../contexts/ContextProvider";
import Actions from "./Actions/Actions";
import About from "./About";
import Settings from "./Settings/Settings";

const NavigationBar = () => {
   const { context } = useGlobalContext();

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
         <div className="d-md-none">{context.currentStep.label}</div>
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

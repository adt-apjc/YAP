import WithDropdown from "../Popper/Dropdown";
import { useGlobalContext } from "../contexts/ContextProvider";

const AboutTooltipContent = () => {
   const { context } = useGlobalContext();

   return (
      <div className="text-dark px-2 py-1" style={{ minWidth: "10rem" }}>
         <div className="custom-dropdown-text text-muted mb-1">About</div>
         <hr className="m-0" />
         <div className="custom-dropdown-text">Demo Version: {`${context.config.demoVersion}`}</div>
         <div className="custom-dropdown-text">Template Version: {`${context.config.templateVersion}`}</div>
         <div className="custom-dropdown-text">YAP Version: 1.1.1</div>
      </div>
   );
};

const About = () => {
   return (
      <WithDropdown
         className="d-none d-sm-block"
         placement="left-start"
         interactive
         offset={[35, -35]}
         DropdownComponent={() => <AboutTooltipContent />}
      >
         <div title="about" className="nav-action me-2">
            <i className="fal fa-question-circle" />
         </div>
      </WithDropdown>
   );
};

export default About;

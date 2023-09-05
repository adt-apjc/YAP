import React, { useState } from "react";
import WithDropdown from "../Popper/Dropdown";

const AboutTooltipContent = ({ setIsOpen }) => {
   return (
      <div className="text-dark px-2 py-1" style={{ minWidth: "10rem" }}>
         <div className="custom-dropdown-text text-muted mb-1">About</div>
         <hr className="m-0" />
         <div className="custom-dropdown-text">Build: {process.env.REACT_APP_BUILD_VERSION || "dev"}</div>
         <div className="custom-dropdown-text">Version: 1.0.0</div>
      </div>
   );
};

const About = () => {
   const [isOpen, setIsOpen] = useState(false);

   return (
      <WithDropdown
         placement="left-start"
         interactive
         offset={[35, -35]}
         open={isOpen}
         onRequestClose={() => setIsOpen(false)}
         DropdownComponent={<AboutTooltipContent setIsOpen={setIsOpen} />}
      >
         <div title="about" className="nav-action me-2" onClick={() => setIsOpen(true)}>
            <i className="fal fa-question-circle" />
         </div>
      </WithDropdown>
   );
};

export default About;

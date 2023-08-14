import React from "react";

const Logo = () => {
   return (
      <div className="d-flex align-items-center mt-2 me-3 mb-2">
         <img src={`${process.env.PUBLIC_URL}/ciscologo.png`} alt="Cisco Logo" className="cisco-logo" />
      </div>
   );
};

export default Logo;

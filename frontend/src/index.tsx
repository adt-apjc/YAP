import React from "react";
import ReactDOM from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "xterm/css/xterm.css";
import App from "./components/App";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
   <React.StrictMode>
      <App />
   </React.StrictMode>,
);

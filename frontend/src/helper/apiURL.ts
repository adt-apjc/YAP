let URL = "";

if (process.env.REACT_APP_API_URL === "SAME_HOST" || process.env.REACT_APP_API_URL === "SAME-HOST") {
   URL = window.location.origin;
} else {
   URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
}
URL = URL.replace(/\/+$/, "");
URL += "/api";
export default URL;

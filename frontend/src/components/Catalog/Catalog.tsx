import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useGlobalContext } from "../contexts/ContextProvider";
import helloWorld from "../../config/config.json";
import CatalogModal from "./CatalogModal";
import { Modal } from "../../helper/modalHelper";
import BACKEND_URL from "../../helper/apiURL";
import { CatalogDetails } from "./CatalogTypes";

type CardProps = {
   catalog: CatalogDetails;
};

const DefaultDemos: CatalogDetails[] = [
   {
      name: "My Demo",
      version: "",
      objective: `Select "Create New" button to load an empty workspace. Select "Import" button to load personal demo config file.`,
      description: "",
      useCases: "",
      requirements: "",
      labels: [],
      path: "",
      iconPath: "",
   },
   {
      name: "Hello World",
      version: "",
      objective:
         " This basic Hello World demo describes the Yet Another Presentation tool (YAP) functionalities by orchestrating a simple project in a safe mockup environment",
      description: "",
      useCases: "",
      requirements: "",
      labels: ["YAP"],
      path: "",
      iconPath: "",
   },
];

const Card = (props: CardProps) => {
   const navigate = useNavigate();
   const { dispatch } = useGlobalContext();
   const importRef = useRef<HTMLInputElement | null>(null);
   const [isDeploying, setIsDeploying] = useState(false);

   // trim labels to only 3
   const labels = props.catalog.labels.length > 3 ? props.catalog.labels.splice(3) : props.catalog.labels;
   const demoName = props.catalog.name.toLowerCase();

   const handleDeploy = async (path: string) => {
      setIsDeploying(true);
      if (path) {
         try {
            let config = {
               baseURL: path,
               method: "GET",
               timeout: 5000, // 5 seconds
            };

            let response = await axios.post(
               `${BACKEND_URL}/api/proxy/request`,
               { ...config },
               {
                  headers: {
                     "Cache-Control": "no-cache",
                     Pragma: "no-cache",
                     Expires: "0",
                  },
               },
            );
            // load config context
            dispatch({ type: "loadConfig", payload: response.data });
            setIsDeploying(false);
         } catch (e) {
            setIsDeploying(false);
            console.log(e);
            return;
         }
      } else {
         // load config context
         dispatch({ type: "loadConfig", payload: helloWorld });
      }

      setIsDeploying(false);
      navigate("/demo");
   };

   const handleCreateNew = () => {
      dispatch({ type: "newConfig" });
      navigate("/demo");
   };

   const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      event.stopPropagation();

      let file = event.target.files![0];
      console.log(file);
      if (file) {
         const reader = new FileReader();
         // define callback
         reader.onabort = () => console.log("file reading was aborted");
         reader.onerror = () => console.log("file reading has failed");
         reader.onloadend = () => {
            const contentString = reader.result;
            try {
               const config = JSON.parse(contentString as string);
               // load config context
               dispatch({ type: "loadConfig", payload: config });
               importRef.current!.value = "";
               navigate("/demo");
            } catch (e) {
               console.log(e);
               importRef.current!.value = "";
            }
         };
         // read file content
         reader.readAsText(file);
      }
   };

   let buttonComponent;
   let defaultIcon;
   if (demoName === "my demo") {
      buttonComponent = (
         <div className="d-flex mt-4">
            <button className="btn btn-sm btn-primary me-3" onClick={handleCreateNew}>
               Create New
            </button>
            <button className="btn btn-sm btn-primary" onClick={() => importRef.current?.click()}>
               Import
               <input
                  id="importFile"
                  type="file"
                  accept="application/json"
                  ref={importRef}
                  style={{ display: "none" }}
                  onChange={onFileChange}
               />
            </button>
         </div>
      );
      defaultIcon = <i className="fas fa-sticky-note" />;
   } else if (demoName === "hello world") {
      defaultIcon = <img src={`${process.env.PUBLIC_URL}/yapping-dog-white.png`} alt={`${demoName}`} className="custom-icon" />;
      buttonComponent = (
         <div className="mt-4">
            <button
               className="btn btn-sm btn-primary"
               onClick={(e) => {
                  e.stopPropagation();
                  handleDeploy(props.catalog.path);
               }}
               disabled={isDeploying}
            >
               {isDeploying && <i className="me-2 far fa-spin fa-spinner" />}
               Deploy
            </button>
         </div>
      );
   } else {
      defaultIcon = <i className="far fa-chart-network" />;
   }

   return (
      <div className="col">
         <div className="card" style={{ height: "330px" }}>
            <div className="card-body">
               <div className="d-flex flex-column align-items-center justify-content-center">
                  <div className="circle-icon" style={{ padding: `${props.catalog.iconPath ? "" : "12px 6px"}` }}>
                     {props.catalog.iconPath ? (
                        <img src={`${props.catalog.iconPath}`} alt={`${demoName}`} className="custom-icon" />
                     ) : (
                        <>{defaultIcon}</>
                     )}
                  </div>
                  <h5 className="p-0 m-0 text-center">{props.catalog.name}</h5>
                  <small className="text-muted ">{props.catalog.version}</small>
                  <small className="mt-4 text-start">{props.catalog.objective}</small>
                  <div className="position-absolute " style={{ bottom: "2rem" }}>
                     <div className="d-flex flex-column justify-content-center align-items-center">
                        <div className="d-flex justify-content-center">
                           {labels.map((l) => {
                              return (
                                 <span key={l} className="badge badge-sm bg-secondary me-2">
                                    {l}
                                 </span>
                              );
                           })}
                        </div>
                        {buttonComponent}
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

const Catalog = () => {
   const navigate = useNavigate();
   const [demoCatalog, setDemoCatalog] = useState<CatalogDetails[]>([]);
   const [loading, setLoading] = useState(false);
   const [searchQuery, setSearchQuery] = useState("");
   const [showModal, setShowModal] = useState(false);
   const [modalParams, setModalParams] = useState<CatalogDetails>();
   const hideModalFrom = ["My Demo", "Hello World"];

   const handleCardClick = (params: any) => {
      if (!hideModalFrom.includes(params.name)) {
         setShowModal(true);
         setModalParams(params);
      }
   };

   const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
   };

   const fetchDemoCatalog = async () => {
      let response;

      try {
         setLoading(true);

         const custom_config = {
            baseURL: process.env.REACT_APP_CATALOG,
            method: "GET",
            timeout: 5000, // 5 seconds
         };

         response = await axios.post(
            `${BACKEND_URL}/api/proxy/request`,
            { ...custom_config },
            {
               headers: {
                  "Cache-Control": "no-cache",
                  Pragma: "no-cache",
                  Expires: "0",
               },
            },
         );

         if (response && response.status === 200) {
            setDemoCatalog(response.data);
            setLoading(false);
            return;
         }
      } catch (e) {
         console.log("Info - There is no REACT_APP_CATALOG variable or can not access the proposed URL");
      }

      // YAP tries to fetch a JSON catalog configuration file called demoCatalog.json, stored locally in the my-public-assets volume that is published by the frontend as my-assets/.
      // Something like http://localhost:4000/my-assets/devCatalog.json when testing locally
      // ******** this option is only available in development mode ********
      if (process.env.NODE_ENV === "development") {
         try {
            setLoading(true);

            response = await axios({
               baseURL: process.env.PUBLIC_URL?.concat("/my-assets/demoCatalog.json"),
               method: "GET",
            });

            if (response && response.status === 200) {
               setDemoCatalog(response.data);
               setLoading(false);
               return;
            }
         } catch (e) {
            console.log("Info - There is no demoCatalog.json in my-assets");
         }
      }

      // As third option, YAP tries to load from the YAP-Zoo catalog. This works when YAP has access to the Cisco network.

      try {
         let config = {
            baseURL: "https://wwwin-github.cisco.com/raw/APJ-GSP-ADT/YAP-Zoo/master/demoCatalog.json",
            method: "GET",
            timeout: 5000, // 5 seconds
         };
         response = await axios.post(
            `${BACKEND_URL}/api/proxy/request`,
            { ...config },
            {
               headers: {
                  "Cache-Control": "no-cache",
                  Pragma: "no-cache",
                  Expires: "0",
               },
            },
         );

         if (response && response.status === 200) {
            setDemoCatalog(response.data);
            setLoading(false);
            return;
         }
      } catch (e) {
         console.log(e);
      }
      setLoading(false);
   };

   const renderLibrary = () => {
      // search demo catalog with name or labels
      const searchKey = searchQuery.toLowerCase();

      // join demoCatalog from repo and default demos "My Demo" and "Hello world"
      const fullDemoCatalog = [...DefaultDemos, ...demoCatalog];

      // filtered catalog based on searchKey
      // eslint-disable-next-line
      const searchResult = fullDemoCatalog.filter((demo) => {
         if (!demo.name) return false;
         if (
            demo.name.toLowerCase().includes(searchKey) ||
            demo.labels.reduce((accumulator, label) => accumulator || label.toLowerCase().includes(searchKey), false)
         )
            return true;
      });

      if (searchResult.length === 0)
         return (
            <div className="d-flex justify-content-center" style={{ height: "330px" }}>
               <h6 className="text-muted">No demo available</h6>
            </div>
         );

      return (
         <div
            className={`row row-cols-1 g-4 
            ${searchResult.length < 3 ? "row-cols-md-1 row-cols-lg-2" : "row-cols-md-2 row-cols-lg-3"}
            `}
         >
            {searchResult.map((demo) => {
               return (
                  <div id={demo.name} key={demo.name} onClick={() => handleCardClick(demo)}>
                     <Card catalog={demo} />
                  </div>
               );
            })}
         </div>
      );
   };

   useEffect(() => {
      const savedState = JSON.parse(window.localStorage.getItem("__internal__configData") as string);
      if (savedState) {
         navigate("/demo");
      } else fetchDemoCatalog(); // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   if (loading)
      return (
         <div className="auth-loading">
            <div className="auth-gradient-text">Loading ...</div>
         </div>
      );

   return (
      <div className="catalog-container overflow-auto">
         <div className="d-flex flex-column align-items-center justify-content-center h-100 w-100 ">
            <div className="d-flex align-items-center justify-content-center">
               <img src={`${process.env.PUBLIC_URL}/ciscologo.png`} alt="Cisco Logo" className="nav-logo" />
               <h2>Use Case Library</h2>
            </div>
            <div className="w-50 mt-3 mb-4">
               <input
                  className="form-control"
                  placeholder="search catalog"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e)}
               />
            </div>
            <div className="container overflow-auto mt-5">{renderLibrary()}</div>
         </div>

         <Modal show={showModal} onHide={() => setShowModal(false)} width="50%">
            <CatalogModal onHide={() => setShowModal(false)} params={modalParams as CatalogDetails} />
         </Modal>
      </div>
   );
};

export default Catalog;

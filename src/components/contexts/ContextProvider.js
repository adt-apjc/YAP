import React from "react";
import config from "../../config/config.json";

const GlobalContext = React.createContext();

export class ContextProvider extends React.Component {
   constructor(props) {
      super(props);
      // Method to update state
      this.setCurrentStep = (step) => {
         this.setState({ currentStep: { ...step } });
      };
      this.toggleMode = () => {
         this.setState({ mode: this.state.mode === "edit" ? "presentation" : "edit" });
      };
      this.setRunningStatus = (step = null, status = null) => {
         if (step === null && status === null) {
            this.setState({ runningStatus: {} });
         } else {
            this.setState({ runningStatus: { ...this.state.runningStatus, [step]: status } }, () =>
               window.localStorage.setItem("runningStatus", JSON.stringify(this.state.runningStatus)),
            );
         }
      };
      this.clearStateHandler = () => {
         for (let key in this.state.clearStateFunction) {
            if (typeof this.state.clearStateFunction[key] === "function") {
               this.state.clearStateFunction[key]();
            }
         }
      };
      this.unregisterClearStateFunction = (key) => {
         delete this.state.clearStateFunction[key];
      };
      this.registerClearStateFunction = (func, key) => {
         console.log("DEBUG - register cleanup function from", key);
         this.setState({ clearStateFunction: { ...this.state.clearStateFunction, [key]: func } });
      };
      this.addAction = (actionObject, tab, stepKey, index = null) => {
         let currentConfig = this.state.config;
         if (index !== null) {
            // this block is for edit
            currentConfig.mainContent[stepKey][tab][index] = actionObject;
         } else {
            // this block is for add new action
            if (currentConfig.mainContent[stepKey][tab]) {
               currentConfig.mainContent[stepKey][tab].push(actionObject);
            } else {
               currentConfig.mainContent[stepKey][tab] = [actionObject];
            }
         }
         this.setState({ config: { ...currentConfig } });
      };
      this.deleteAction = (tab, stepKey, index) => {
         let currentConfig = this.state.config;
         currentConfig.mainContent[stepKey][tab].splice(index, 1);
         this.setState({ config: { ...currentConfig } });
      };
      this.addStep = (name) => {
         let currentConfig = this.state.config;
         let newStepName = `Step_${currentConfig.sidebar.length + 1}`;
         currentConfig.sidebar.push({ name: newStepName, label: name });
         currentConfig.mainContent[newStepName] = {};
         this.setState({ config: { ...currentConfig } });
      };
      this.deleteStep = (name) => {
         let currentConfig = this.state.config;
         currentConfig.sidebar = currentConfig.sidebar.filter((el) => el.name !== name);
         delete currentConfig.mainContent[name];
         if (name === this.state.currentStep.name) {
            this.setState({ config: { ...currentConfig }, currentStep: {} });
         } else {
            this.setState({ config: { ...currentConfig } });
         }
      };
      this.addEndpoint = (name, baseURL, headerList) => {
         let currentConfig = this.state.config;
         currentConfig.endpoints[name] = {
            baseURL,
            headers: headerList.reduce((result, item) => {
               result[item.key] = item.value;
               return result;
            }, {}),
         };
         this.setState({ config: { ...currentConfig } });
      };
      this.deleteEndpoint = (name) => {
         let currentConfig = this.state.config;
         delete currentConfig.endpoints[name];
         this.setState({ config: { ...currentConfig } });
      };
      this.updateConfig = (config) => {
         this.setState({ config: { ...config } });
      };
      this.clearConfig = () => {
         window.localStorage.clear();
         this.setState({ config: { ...config }, currentStep: {} }, this.clearStateHandler);
      };
      // Context state
      this.state = {
         currentStep: config.preface ? {} : { ...config.sidebar[0] },
         runningStatus: {},
         clearStateFunction: {},
         config: config,
         mode: "edit",
         toggleMode: this.toggleMode,
         setCurrentStep: this.setCurrentStep,
         setRunningStatus: this.setRunningStatus,
         clearStateHandler: this.clearStateHandler,
         unregisterClearStateFunction: this.unregisterClearStateFunction,
         registerClearStateFunction: this.registerClearStateFunction,
         addAction: this.addAction,
         deleteAction: this.deleteAction,
         addStep: this.addStep,
         deleteStep: this.deleteStep,
         addEndpoint: this.addEndpoint,
         deleteEndpoint: this.deleteEndpoint,
         updateConfig: this.updateConfig,
         clearConfig: this.clearConfig,
      };
   }

   componentDidMount() {
      const consigData = window.localStorage.getItem("configData");
      const runningStatus = window.localStorage.getItem("runningStatus");
      // load config from localStorage if exist
      if (consigData) {
         this.setState({ config: { ...JSON.parse(consigData) } });
      }
      // load runningStatus from localStorage if exist
      if (runningStatus) {
         this.setState({ runningStatus: { ...JSON.parse(runningStatus) } });
      }
   }

   render() {
      const { children } = this.props;
      return <GlobalContext.Provider value={this.state}>{children}</GlobalContext.Provider>;
   }
}

export default GlobalContext;

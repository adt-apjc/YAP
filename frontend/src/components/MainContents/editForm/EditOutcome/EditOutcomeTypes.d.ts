import cytoscape from "cytoscape";
import { OutcomeCommandConfig, OutcomeConfig, SSHConfig, config } from "../../../contexts/ContextTypes";

export type OutcomeSelectedElem = {
   data: any;
   style: cytoscape.CssStyleDeclaration;
   classes: string[];
   commands?: OutcomeCommandConfig[];
   ssh?: SSHConfig;
};

export type EditOutcomeProps = {
   onHide: () => void;
   initValue: OutcomeConfig[];
};

export type AddNodeFormProps = {
   onAddElement: (elem: AddNodeParams, isNew?: boolean) => void;
   nodeList: cytoscape.ElementDefinition[];
   edgeList: cytoscape.ElementDefinition[];
   initValue: OutcomeSelectedElem | null;
};

export type AddEdgeFormProps = {
   onAddElement: (elem: AddEdgeParams) => void;
   nodeList: cytoscape.ElementDefinition[];
   edgeList: cytoscape.ElementDefinition[];
   initValue: OutcomeSelectedElem | null;
};

export type AddSSHInfoFormProps = {
   nodeId: string;
   enableSSH: boolean;
   setEnableSSH: React.Dispatch<React.SetStateAction<boolean>>;
   sshInfo: SSHConfig;
   setSSHinfo: React.Dispatch<React.SetStateAction<SSHConfig>>;
};

export type AddCommandFormProps = {
   nodeId: string;
   enableCommand: boolean;
   setEnableCommand: React.Dispatch<React.SetStateAction<boolean>>;
   commands: OutcomeCommandConfig[];
   setCommands: React.Dispatch<React.SetStateAction<OutcomeCommandConfig[]>>;
};

export type CommitFormButtonProps = {
   shouldComfirm: boolean;
   saveHandler: () => void;
};

export type CloneCommandSelectorProps = {
   close: () => void;
   elements?: { name: string; label: string }[];
   setCommands: React.Dispatch<React.SetStateAction<OutcomeCommandConfig[]>>;
};

export type AddNodeParams = {
   data: {
      id: string;
      label: string;
      width: string;
      height: string;
      imglink?: string;
   };
   classes: string;
   commands?: OutcomeCommandConfig[];
   ssh?: SSHConfig;
};

export type AddEdgeParams = {
   data: {
      id: string;
      source: string;
      target: string;
      label: string;
   };
   classes: string;
};

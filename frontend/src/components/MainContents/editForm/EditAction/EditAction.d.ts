import {
   ActionConfig,
   ActionExpectObject,
   ActionMatchObject,
   RestActionConfig,
   SSHActionConfig,
} from "../../../contexts/ContextTypes";
import RestAPIForm from "./RestAPIForm";

export type ActionFormProps = {
   onHide: () => void;
   initValue: { action: any; actionIndex: number } | null;
   tab: "preCheck" | "actions" | "postCheck";
};

export type RestAPIFormProps = Omit<ActionFormProps, "initValue"> & {
   initValue: { action: RestActionConfig; actionIndex: number } | null;
};

export type SSHCliFormProps = Omit<ActionFormProps, "initValue"> & {
   initValue: { action: SSHActionConfig; actionIndex: number } | null;
};

export type VariableFormProps = {
   match: ActionMatchObject | undefined;
   setMatch: (m: ActionMatchObject | undefined) => void;
   input: ActionConfig;
};

export type ExpectFormProps = {
   expect: ActionExpectObject;
   setExpect: (e: ActionExpectObject) => void;
};

export type PayloadTypeSelectorProps = {
   payloadType: string;
   setPayloadType: (v: string) => void;
};

export type HeaderFormInput = { key: string; value: string };

export type HeadersFormProps = {
   input: RestActionConfig;
   inputHeaders: HeaderFormInput[];
   setInputHeaders: React.Dispatch<React.SetStateAction<HeaderFormInput[]>>;
};

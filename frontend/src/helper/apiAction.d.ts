import { AxiosResponse } from "axios";

export type APIResponse = AxiosResponse & { success: boolean; statusText?: string };

export type SSHCLIResponse = { response: string; success: boolean; statusText?: string };

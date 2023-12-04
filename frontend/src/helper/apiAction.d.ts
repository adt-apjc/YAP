import { AxiosResponse } from "axios";

export type APIResponse = AxiosResponse & { success: boolean; failureCause?: string };

export type SSHCLIResponse = { response: string; success: boolean; failureCause?: string };

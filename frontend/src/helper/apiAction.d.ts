import { AxiosResponse } from "axios";

export type APIResponse = AxiosResponse & { success: boolean; failureCause?: string };

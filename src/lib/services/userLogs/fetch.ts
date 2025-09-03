import { axiosAuthorized } from "src/core/utils/axios";

import { USER_LOGS_PATHS } from ".";
import type { UserLogsResponse } from "./types";

type Params = {
    page?: number;
    limit?: number;
    teamId?: string;
    action?: "add" | "create" | "edit" | "delete" | "clone";
    configLevel?: "main" | "global" | "repository";
    userId?: string;
    userEmail?: string;
    repositoryId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
};

export const getUserLogs = (params?: Params) => {
    return axiosAuthorized
        .fetcher(USER_LOGS_PATHS.GET_LOGS, { params })
        .then((r) => r.data as UserLogsResponse);
};

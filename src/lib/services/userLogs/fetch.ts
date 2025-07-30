import { typedFetch } from "@services/fetch";
import type { UserLogsResponse } from "./types";

import { USER_LOGS_PATHS } from ".";

export const getUserLogs = (params?: {
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
}) =>
    typedFetch<UserLogsResponse>(USER_LOGS_PATHS.GET_LOGS, {
        params,
    }); 
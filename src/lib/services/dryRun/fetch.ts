import { authorizedFetch } from "@services/fetch";
import { axiosAuthorized } from "src/core/utils/axios";

import { DRY_RUN_PATHS } from ".";
import { DryRunStatus, IDryRunData } from "./types";

export const executeDryRun = async (
    teamId: string,
    repositoryId: string,
    prNumber: number,
): Promise<string> => {
    try {
        const response = await axiosAuthorized.post<{
            data: string;
        }>(DRY_RUN_PATHS.EXECUTE, {
            teamId,
            repositoryId,
            prNumber,
        });

        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.status || "Unknown error");
    }
};

export const fetchDryRunStatus = async (
    correlationId: string,
    teamId: string,
): Promise<DryRunStatus> => {
    try {
        const response = await authorizedFetch<DryRunStatus>(
            `${DRY_RUN_PATHS.GET_STATUS}/${correlationId}`,
            {
                params: { teamId },
            },
        );

        return response;
    } catch (error: any) {
        throw new Error(error.response?.status || "Unknown error");
    }
};

export const fetchDryRunDetails = async (
    correlationId: string,
    teamId: string,
): Promise<IDryRunData | null> => {
    try {
        const response = await authorizedFetch<IDryRunData | null>(
            `${DRY_RUN_PATHS.GET}/${correlationId}`,
            {
                params: { teamId },
            },
        );

        return response;
    } catch (error: any) {
        throw new Error(error.response?.status || "Unknown error");
    }
};

export const listDryRuns = async (
    teamId: string,
    filters?: {
        repositoryId?: string;
        directoryId?: string;
        status?: DryRunStatus;
        startDate?: string;
        endDate?: string;
        prNumber?: number;
    },
): Promise<IDryRunData[]> => {
    try {
        const response = await authorizedFetch<IDryRunData[]>(
            DRY_RUN_PATHS.LIST,
            {
                params: { teamId, ...filters },
            },
        );

        return response;
    } catch (error: any) {
        throw new Error(error.response?.status || "Unknown error");
    }
};

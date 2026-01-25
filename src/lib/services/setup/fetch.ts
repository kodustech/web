import type { INTEGRATIONS_KEY } from "@enums";
import { authorizedFetch } from "@services/fetch";
import { axiosAuthorized } from "src/core/utils/axios";

import { SETUP_PATHS } from ".";

export function getConnectionsOnClient(teamId: string) {
    return axiosAuthorized
        .fetcher(SETUP_PATHS.CONNECTIONS, {
            params: { teamId },
        })
        .then((r) => r.data)
        .catch((error) => {
            console.error("Failed to fetch connections:", error);
            return [];
        }) as Promise<
        Array<{
            platformName: keyof typeof INTEGRATIONS_KEY;
            isSetupComplete: boolean;
            hasConnection: boolean;
            category:
                | "COMMUNICATION"
                | "PROJECT_MANAGEMENT"
                | "CODE_MANAGEMENT";
            config?: { [key: string]: string };
        }>
    >;
}

export function getConnections(teamId: string) {
    return authorizedFetch(SETUP_PATHS.CONNECTIONS, {
        params: { teamId },
    }) as Promise<
        Array<{
            platformName: keyof typeof INTEGRATIONS_KEY;
            isSetupComplete: boolean;
            hasConnection: boolean;
            category:
                | "COMMUNICATION"
                | "PROJECT_MANAGEMENT"
                | "CODE_MANAGEMENT";
            config?: { [key: string]: string };
        }>
    >;
}

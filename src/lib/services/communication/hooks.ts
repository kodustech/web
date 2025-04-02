import { Communication } from "@services/setup/types";
import { IntegrationsCommon } from "src/core/types";
import { useFetch, useSuspenseFetch } from "src/core/utils/reactQuery";

import { COMMUNICATION_PATHS } from ".";

export function useSuspenseGetChannels(teamId: string) {
    return useSuspenseFetch<IntegrationsCommon[]>(
        COMMUNICATION_PATHS.GET_CHANNELS,
        { params: { teamId: teamId } },
    );
}

export function useGetCommunicationMembers() {
    return useFetch<Communication[]>(COMMUNICATION_PATHS.COMMUNICATION_MEMBERS);
}

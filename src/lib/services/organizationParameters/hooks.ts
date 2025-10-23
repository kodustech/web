import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CockpitMetricsVisibility } from "@services/parameters/types";
import { useSuspenseFetch } from "src/core/utils/reactQuery";

import { ORGANIZATION_PARAMETERS_PATHS } from ".";
import {
    getCockpitMetricsVisibility,
    updateCockpitMetricsVisibility,
} from "./fetch";

export function useSuspenseGetLLMProviders() {
    return useSuspenseFetch<{
        providers: Array<{
            id: string;
            name: string;
            requiresApiKey: boolean;
            requiresBaseUrl: boolean;
        }>;
    }>(ORGANIZATION_PARAMETERS_PATHS.GET_PROVIDERS_LIST);
}

export function useSuspenseGetLLMProviderModels({
    provider,
}: {
    provider: string;
}) {
    return useSuspenseFetch<{ models: Array<{ id: string; name: string }> }>(
        ORGANIZATION_PARAMETERS_PATHS.GET_PROVIDER_MODELS_LIST,
        { params: { provider } },
    );
}

export function useCockpitMetricsVisibility(organizationId: string) {
    return useQuery({
        queryKey: ["cockpit-metrics-visibility", organizationId],
        queryFn: () => getCockpitMetricsVisibility({ organizationId }),
        enabled: !!organizationId,
    });
}

export function useUpdateCockpitMetricsVisibility() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params: {
            organizationId: string;
            teamId?: string;
            config: CockpitMetricsVisibility;
        }) => updateCockpitMetricsVisibility(params),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["cockpit-metrics-visibility", variables.organizationId],
            });
        },
    });
}

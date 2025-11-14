import {
    OrganizationParametersConfigKey,
    type CockpitMetricsVisibility,
} from "@services/parameters/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSuspenseFetch } from "src/core/utils/reactQuery";
import type { BYOKConfig } from "src/features/ee/byok/_types";
import { useOrganizationContext } from "src/features/organization/_providers/organization-context";

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

// TODO: remove, unused
export function useCockpitMetricsVisibility(organizationId: string) {
    return useQuery({
        queryKey: ["cockpit-metrics-visibility", organizationId],
        queryFn: () => getCockpitMetricsVisibility({ organizationId }),
        enabled: !!organizationId,
    });
}

export function useSuspenseGetBYOK() {
    const { organizationId } = useOrganizationContext();
    return useSuspenseFetch<{
        configValue: { main: BYOKConfig; fallback: BYOKConfig };
    } | null>(
        ORGANIZATION_PARAMETERS_PATHS.GET_BY_KEY,
        {
            params: {
                key: OrganizationParametersConfigKey.BYOK_CONFIG,
                organizationId,
            },
        },
        {
            fallbackData: null,
        },
    );
}

// TODO: remove, unused
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
                queryKey: [
                    "cockpit-metrics-visibility",
                    variables.organizationId,
                ],
            });
        },
    });
}

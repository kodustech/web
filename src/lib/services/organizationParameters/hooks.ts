import { OrganizationParametersConfigKey } from "@services/parameters/types";
import { useSuspenseFetch } from "src/core/utils/reactQuery";
import type { BYOKConfig } from "src/features/ee/byok/_types";

import { ORGANIZATION_PARAMETERS_PATHS } from ".";

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

export function useSuspenseGetBYOK() {
    return useSuspenseFetch<{
        configValue: { main: BYOKConfig; fallback: BYOKConfig };
    } | null>(
        ORGANIZATION_PARAMETERS_PATHS.GET_BY_KEY,
        {
            params: {
                key: OrganizationParametersConfigKey.BYOK_CONFIG,
            },
        },
        {
            fallbackData: null,
        },
    );
}

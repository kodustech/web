import { useSuspenseFetch } from "src/core/utils/reactQuery";

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

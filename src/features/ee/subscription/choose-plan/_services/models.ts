type ModelCost = {
    input: number;
    output: number;
};

type ModelInfo = {
    id: string;
    name: string;
    cost: ModelCost;
};

type ProviderModels = {
    models: Record<string, ModelInfo>;
};

type ModelsDevResponse = Record<string, ProviderModels>;

export type SimulatorModel = {
    id: string;
    name: string;
    provider: string;
    providerId: string;
    costPerMillionInput: number;
    costPerMillionOutput: number;
};

// Popular models to show in the simulator (max 3 per provider)
const POPULAR_MODELS = [
    // Anthropic
    "claude-opus-4-5",
    "claude-sonnet-4-5",
    "claude-haiku-4-5",
    // OpenAI
    "gpt-5.2",
    "gpt-5-mini",
    "gpt-5-nano",
    // Google
    "gemini-2.5-pro", // Used during trial
    "gemini-3-pro-preview",
    "gemini-3-flash-preview",
    // Open Source
    "glm-4.7",
    "kimi-k2.5",
    "MiniMax-M2.1",
];

// Provider display order (main providers first, then open source)
const PROVIDER_ORDER = [
    "anthropic",
    "openai",
    "google",
    "zhipuai",
    "moonshotai",
    "minimax",
];

const PROVIDER_LABELS: Record<string, string> = {
    anthropic: "Anthropic",
    openai: "OpenAI",
    google: "Google",
    zhipuai: "Zhipu",
    moonshotai: "Moonshot",
    minimax: "MiniMax",
};

// Cache for models.dev data to avoid multiple fetches
let modelsDevCache: ModelsDevResponse | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 3600000; // 1 hour in ms

async function getModelsDevData(): Promise<ModelsDevResponse | null> {
    const now = Date.now();
    if (modelsDevCache && now - cacheTimestamp < CACHE_TTL) {
        return modelsDevCache;
    }

    try {
        const response = await fetch("https://models.dev/api.json", {
            next: { revalidate: 3600 },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch models");
        }

        modelsDevCache = await response.json();
        cacheTimestamp = now;
        return modelsDevCache;
    } catch (error) {
        console.error("Failed to fetch models.dev data:", error);
        return null;
    }
}

// Model ID mappings for common variations
const MODEL_ID_MAPPINGS: Record<string, string> = {
    // Anthropic variations
    "claude-3-5-sonnet-20241022": "claude-3.5-sonnet",
    "claude-3-5-haiku-20241022": "claude-3.5-haiku",
    "claude-3-opus-20240229": "claude-3-opus",
    "claude-3-sonnet-20240229": "claude-3-sonnet",
    "claude-3-haiku-20240307": "claude-3-haiku",
    // OpenAI variations
    "gpt-4o-2024-11-20": "gpt-4o",
    "gpt-4o-mini-2024-07-18": "gpt-4o-mini",
    "gpt-4-turbo-2024-04-09": "gpt-4-turbo",
    // Google variations
    "gemini-2.0-flash-exp": "gemini-2.0-flash",
    "gemini-1.5-pro-latest": "gemini-1.5-pro",
    "gemini-1.5-flash-latest": "gemini-1.5-flash",
};

/**
 * Fetch pricing for a specific model from models.dev
 * Returns pricing in per-token format (compatible with ModelPricingInfo)
 */
export async function fetchModelPricingFromModelsDev(
    modelId: string,
): Promise<{ prompt: number; completion: number } | null> {
    const data = await getModelsDevData();
    if (!data) return null;

    // Try the original model ID first, then try mapped variations
    const idsToTry = [
        modelId,
        MODEL_ID_MAPPINGS[modelId],
        // Try without date suffix
        modelId.replace(/-\d{8}$/, ""),
        // Try with dots instead of dashes for version numbers
        modelId.replace(/-(\d+)-(\d+)-/, "-$1.$2-"),
    ].filter(Boolean);

    for (const [, provider] of Object.entries(data)) {
        if (!provider.models) continue;

        for (const idToTry of idsToTry) {
            const model = provider.models[idToTry as string];
            if (model?.cost?.input && model?.cost?.output) {
                // Convert from per-1M tokens to per-token
                return {
                    prompt: model.cost.input / 1_000_000,
                    completion: model.cost.output / 1_000_000,
                };
            }
        }
    }

    return null;
}

export async function fetchPopularModels(): Promise<SimulatorModel[]> {
    try {
        // Use cached data instead of fetching again
        const data = await getModelsDevData();
        if (!data) return [];

        const models: SimulatorModel[] = [];

        for (const [providerId, provider] of Object.entries(data)) {
            // Only include known providers
            if (!PROVIDER_LABELS[providerId]) continue;
            if (!provider.models) continue;

            const providerLabel = PROVIDER_LABELS[providerId];

            for (const [modelId, model] of Object.entries(provider.models)) {
                if (!POPULAR_MODELS.includes(modelId)) continue;
                if (!model.cost?.input || !model.cost?.output) continue;

                models.push({
                    id: modelId,
                    name: model.name,
                    provider: providerLabel,
                    providerId,
                    costPerMillionInput: model.cost.input,
                    costPerMillionOutput: model.cost.output,
                });
            }
        }

        // Sort by provider order, then by cost (cheapest first)
        return models.sort((a, b) => {
            const aOrder = PROVIDER_ORDER.indexOf(a.providerId);
            const bOrder = PROVIDER_ORDER.indexOf(b.providerId);
            if (aOrder !== bOrder) {
                return aOrder - bOrder;
            }
            return a.costPerMillionInput - b.costPerMillionInput;
        });
    } catch (error) {
        console.error("Failed to fetch models from models.dev:", error);
        return [];
    }
}

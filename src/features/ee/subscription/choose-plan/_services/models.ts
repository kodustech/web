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

export async function fetchPopularModels(): Promise<SimulatorModel[]> {
    try {
        const response = await fetch("https://models.dev/api.json", {
            next: { revalidate: 3600 }, // Cache for 1 hour
        });

        if (!response.ok) {
            throw new Error("Failed to fetch models");
        }

        const data: ModelsDevResponse = await response.json();
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

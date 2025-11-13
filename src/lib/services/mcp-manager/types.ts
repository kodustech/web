export type PluginAuthScheme = "BEARER_TOKEN" | "API_KEY" | "OAUTH2" | "BASIC";

export enum MCP_CONNECTION_STATUS {
    ACTIVE = "ACTIVE",
    PENDING = "PENDING",
}

export type CustomMCPPlugin = {
    id: string;
    name: string;
    description: string;
    authScheme: PluginAuthScheme;
    appName: string;
    logo: string;
    provider: string;
    isConnected: boolean;
};

export const CUSTOM_MCP_AUTH_METHODS = {
    NONE: "none",
    BEARER: "bearer_token",
    BASIC: "basic",
    API_KEY: "api_key",
    OAUTH2: "oauth2",
} as const;

export type CustomMCPAuthMethodType =
    (typeof CUSTOM_MCP_AUTH_METHODS)[keyof typeof CUSTOM_MCP_AUTH_METHODS];

export const CUSTOM_MCP_PROTOCOLS = {
    HTTP: "http",
    SSE: "sse",
} as const;

export type CustomMCPProtocolType =
    (typeof CUSTOM_MCP_PROTOCOLS)[keyof typeof CUSTOM_MCP_PROTOCOLS];

export const CUSTOM_MCP_SESSION_STORAGE_KEYS = {
    INTEGRATION_ID: "mcp_custom_integration_id",
    INTEGRATION_NAME: "mcp_custom_integration_name",
} as const;

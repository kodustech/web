import { mcpManagerFetch } from "./utils";

type PluginAuthScheme = "BEARER_TOKEN" | "API_KEY" | "OAUTH2" | "BASIC";
export enum MCP_CONNECTION_STATUS {
    ACTIVE = "ACTIVE",
    PENDING = "PENDING",
}

export const getMCPPlugins = () =>
    mcpManagerFetch<
        Array<{
            id: string;
            name: string;
            description: string;
            authScheme: PluginAuthScheme;
            appName: string;
            logo: string;
            provider: string;
            isConnected: boolean;
            connectionStatus?: MCP_CONNECTION_STATUS;
            isDefault?: boolean;
        }>
    >("/mcp/integrations", { params: { page: 1, pageSize: 100 } });

export const getMCPPluginById = ({
    id,
    provider,
}: {
    id: string;
    provider: string;
}) =>
    mcpManagerFetch<{
        id: string;
        name: string;
        description: string;
        authScheme: PluginAuthScheme;
        appName: string;
        logo: string;
        provider: string;
        allowedTools: Array<string>;
        isConnected: boolean;
        isDefault?: boolean;
        connectionId?: string;
        mcpConnectionId?: string;
        requiredParams: Array<{
            name: string;
            displayName: string;
            description: string;
            type: "string";
            required: boolean;
        }>;
    }>(`/mcp/${provider}/integrations/${id}`);

export const getMCPPluginTools = ({
    id,
    provider,
}: {
    id: string;
    provider: string;
}) =>
    mcpManagerFetch<
        Array<{
            slug: string;
            name: string;
            description: string;
            provider: string;
            warning: boolean;
        }>
    >(`/mcp/${provider}/integrations/${id}/tools`);

export const installMCPPlugin = async ({
    id,
    provider,
    allowedTools,
    authParams = {},
}: {
    id: string;
    provider: string;
    allowedTools: string[];
    authParams: Record<string, any>;
}) => {
    const response = await mcpManagerFetch<{
        id: string;
        integrationId: string;
        organizationId: string;
        status: MCP_CONNECTION_STATUS;
        provider: string;
        mcpUrl: string;
        appName: string;
        allowedTools: Array<string>;
        metadata: {
            connection: {
                id: string;
                appName: string;
                authUrl: string;
                status: MCP_CONNECTION_STATUS;
                mcpUrl: string;
                allowedTools: Array<string>;
            };
        };
    }>(`/mcp/${provider}/connect`, {
        method: "POST",
        body: JSON.stringify({
            integrationId: id,
            allowedTools,
            authParams,
        }),
    });

    return response;
};

export const finishOauthMCPPluginInstallation = async ({
    id,
}: {
    id: string;
}) => {
    const response = await mcpManagerFetch<{}>(`/mcp/connections`, {
        method: "PATCH",
        body: JSON.stringify({
            integrationId: id,
            status: MCP_CONNECTION_STATUS.ACTIVE,
        }),
    });

    return response;
};

export const deleteMCPConnection = async ({
    connectionId,
}: {
    connectionId: string;
}) => {
    const response = await mcpManagerFetch<{}>(
        `/mcp/connections/${connectionId}`,
        {
            method: "DELETE",
            body: JSON.stringify({}),
        },
    );

    return response;
};

export const getMCPConnections = () =>
    mcpManagerFetch<{
        items: Array<{
            id: string;
            integrationId: string;
            organizationId: string;
            status: MCP_CONNECTION_STATUS;
            provider: string;
            mcpUrl: string;
            appName: string;
            allowedTools: Array<string>;
        }>;
        total: number;
    }>("/mcp/connections");

export const getMCPConnection = async ({
    integrationId,
}: {
    integrationId: string;
}) => {
    const response = await mcpManagerFetch<{
        id: string;
        integrationId: string;
        organizationId: string;
        status: MCP_CONNECTION_STATUS;
        provider: string;
        mcpUrl: string;
        appName: string;
        ALLOWED_TOOLS: Array<string>;
    }>(`/mcp/connections/${integrationId}`);

    return response;
};

export const updateMCPAllowedTools = async ({
    integrationId,
    allowedTools,
}: {
    integrationId: string;
    allowedTools: string[];
}) => {
    const response = await mcpManagerFetch<{
        id: string;
        integrationId: string;
        organizationId: string;
        status: MCP_CONNECTION_STATUS;
        provider: string;
        mcpUrl: string;
        appName: string;
        allowedTools: Array<string>;
    }>(`/mcp/connections/${integrationId}/allowed-tools`, {
        method: "PUT",
        body: JSON.stringify({
            allowedTools,
        }),
    });

    return response;
};

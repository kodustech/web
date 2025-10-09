import {
    getMCPConnections,
    getMCPPluginById,
    getMCPPlugins,
    getMCPPluginTools,
} from "@services/mcp-manager/fetch";
import type { AwaitedReturnType } from "src/core/types";

import { PluginModal } from "./_components/modal";

export default async function PluginModalPage({
    params,
}: {
    params: Promise<{ provider: string; id: string }>;
}) {
    const { id, provider } = await params;
    let installedPlugins: AwaitedReturnType<typeof getMCPPlugins> = [];

    let plugin;
    try {
        plugin = await getMCPPluginById({ id, provider });
        const allPlugins = await getMCPPlugins();
        installedPlugins = allPlugins.filter((p) => p.isConnected);
    } catch (error) {
        console.error("Error fetching plugin data:", error);
        return null;
    }

    let tools: AwaitedReturnType<typeof getMCPPluginTools> = [];
    try {
        const fetchedTools = await getMCPPluginTools({ id, provider });
        tools = fetchedTools || [];
    } catch (error) {
        console.error(
            "Error fetching plugin tools, continuing without them:",
            error,
        );
    }

    if (plugin.isConnected) {
        try {
            const connectionsResponse = await getMCPConnections();
            const connections = connectionsResponse.items || [];
            const connection = connections.find(
                (conn) => conn.integrationId === id,
            );

            if (connection) {
                const pluginWithConnection = {
                    ...plugin,
                    allowedTools: connection.allowedTools || [],
                    connectionId: connection.id,
                };

                return (
                    <PluginModal
                        tools={tools}
                        plugin={pluginWithConnection}
                        installedPlugins={installedPlugins}
                    />
                );
            }
        } catch (connectionError) {
            console.error("Error fetching connections:", connectionError);
            console.error(
                "Error details:",
                JSON.stringify(connectionError, null, 2),
            );
        }
    }

    return (
        <PluginModal
            tools={tools}
            plugin={plugin}
            installedPlugins={installedPlugins}
        />
    );
}

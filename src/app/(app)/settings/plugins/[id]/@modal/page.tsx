import {
    getMCPConnections,
    getMCPPluginById,
    getMCPPluginTools,
} from "@services/mcp-manager/fetch";
import type { AwaitedReturnType } from "src/core/types";

import { PluginModal } from "./_components/modal";

export default async function PluginModalPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    // Buscar dados do plugin primeiro
    let plugin;
    try {
        plugin = await getMCPPluginById({ id });
    } catch (error) {
        console.error("Error fetching plugin data:", error);
        return null;
    }

    let tools: AwaitedReturnType<typeof getMCPPluginTools> = [];
    try {
        const fetchedTools = await getMCPPluginTools({ id });
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
                    <PluginModal plugin={pluginWithConnection} tools={tools} />
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

    return <PluginModal plugin={plugin} tools={tools} />;
}

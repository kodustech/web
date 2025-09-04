import {
    getMCPConnections,
    getMCPPluginById,
    getMCPPluginTools,
} from "@services/mcp-manager/fetch";

import { PluginModal } from "./_components/modal";

export default async function PluginModalPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    try {
        const [plugin, tools] = await Promise.all([
            getMCPPluginById({ id }),
            getMCPPluginTools({ id }),
        ]);


        // Se o plugin estiver conectado, buscar dados da conexão para obter allowedTools
        if (plugin.isConnected) {
            try {
                const connectionsResponse = await getMCPConnections();

                const connections = connectionsResponse.items || [];

                // Encontrar a conexão que corresponde ao plugin (integrationId = plugin.id)
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
                            plugin={pluginWithConnection}
                            tools={tools || []}
                        />
                    );
                } else {
                    return <PluginModal plugin={plugin} tools={tools || []} />;
                }
            } catch (connectionError) {
                console.error("Error fetching connections:", connectionError);
                console.error(
                    "Error details:",
                    JSON.stringify(connectionError, null, 2),
                );
                // Se falhar ao buscar conexões, usar dados do plugin
                return <PluginModal plugin={plugin} tools={tools || []} />;
            }
        }

        return <PluginModal plugin={plugin} tools={tools || []} />;
    } catch (error) {
        console.error("Error fetching plugin data:", error);

        // Fallback: buscar apenas o plugin se tools falhar
        const plugin = await getMCPPluginById({ id });
        return <PluginModal plugin={plugin} tools={[]} />;
    }
}

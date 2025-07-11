import {
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

    const [plugin, tools] = await Promise.all([
        getMCPPluginById({ id }),
        getMCPPluginTools({ id }),
    ]);

    return <PluginModal plugin={plugin} tools={tools} />;
}

import { getMCPPluginById } from "@services/mcp-manager/fetch";

import { AddCustomPluginModal } from "./_components/modal";

export default async function AddCustomPluginModalPage({
    searchParams,
}: {
    searchParams?: { [key: string]: string | string[] | undefined };
}) {
    const params = await searchParams;
    const edit = params?.edit;
    const id = params?.id;

    if (edit) {
        const editBool = edit === "true";

        if (editBool && id && typeof id === "string") {
            const plugin = await getMCPPluginById({ id, provider: "custom" });

            return <AddCustomPluginModal pluginToEdit={plugin} />;
        }
    }

    return <AddCustomPluginModal />;
}

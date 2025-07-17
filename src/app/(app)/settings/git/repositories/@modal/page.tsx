import { redirect } from "next/navigation";
import { getIntegrationConfig } from "@services/integrations/integrationConfig/fetch";
import { getConnections } from "@services/setup/fetch";
import { getGlobalSelectedTeamId } from "src/core/utils/get-global-selected-team-id";

import { SelectRepositoriesModal } from "../../_components/_modals/select-repositories-modal";

const providers = {
    azure_repos: {
        readableName: "Azure Repos",
        segmentKey: "azure_repos",
    },
    github: {
        readableName: "Github",
        segmentKey: "github",
    },
    gitlab: {
        readableName: "Gitlab",
        segmentKey: "gitlab",
    },
    bitbucket: {
        readableName: "Bitbucket",
        segmentKey: "bitbucket",
    },
} as const satisfies Record<
    string,
    { readableName: string; segmentKey: string }
>;

export default async function GitRepositories() {
    const teamId = await getGlobalSelectedTeamId();
    const [connections, selectedRepositories] = await Promise.all([
        getConnections(teamId),
        getIntegrationConfig({ teamId }),
    ]);

    const gitConnection = connections.find(
        (c) => c.category === "CODE_MANAGEMENT",
    );
    if (!gitConnection) redirect("/settings/git");

    const provider =
        providers[
            gitConnection.platformName.toLowerCase() as keyof typeof providers
        ];

    return (
        <SelectRepositoriesModal
            platformName={provider.readableName}
            segmentPlatformName={provider.segmentKey}
            selectedRepositories={selectedRepositories}
        />
    );
}

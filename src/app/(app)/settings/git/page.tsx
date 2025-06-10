import { redirect } from "next/navigation";
import { Page } from "@components/ui/page";
import { getIntegrationConfig } from "@services/integrations/integrationConfig/fetch";
import { getConnections } from "@services/setup/fetch";
import { getGlobalSelectedTeamId } from "src/core/utils/get-global-selected-team-id";
import { getCurrentPathnameOnServerComponents } from "src/core/utils/headers";

import { GitProviders } from "./_components/_providers";
import { GitConnectedProvider } from "./_components/connected-provider";
import { GitRepositoriesTable } from "./_components/table";

export default async function GitSettings() {
    const teamId = await getGlobalSelectedTeamId();

    const [connections, connectedRepositories] = await Promise.all([
        getConnections(teamId),
        getIntegrationConfig({ teamId }),
    ]);

    const gitConnection = connections.find(
        (c) => c.category === "CODE_MANAGEMENT",
    );

    const pathname = await getCurrentPathnameOnServerComponents();

    // 1. condition: team has a git provider connected, but no repositories were selected;
    // 2. pathname checking to avoid infinite redirect loop with Parallel Route `/settings/git/repositories`;
    if (
        gitConnection &&
        connectedRepositories.length === 0 &&
        pathname === "/settings/git"
    ) {
        redirect("/settings/git/repositories");
    }

    return (
        <Page.Root>
            <Page.Header>
                <Page.Title>Git Settings</Page.Title>

                {gitConnection && (
                    <Page.HeaderActions>
                        <GitConnectedProvider connection={gitConnection} />
                    </Page.HeaderActions>
                )}
            </Page.Header>

            <Page.Content>
                {gitConnection ? (
                    <GitRepositoriesTable
                        platformName={gitConnection.platformName}
                        repositories={connectedRepositories}
                    />
                ) : (
                    <GitProviders />
                )}
            </Page.Content>
        </Page.Root>
    );
}

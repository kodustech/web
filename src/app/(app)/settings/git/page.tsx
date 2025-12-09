import { redirect } from "next/navigation";
import { Page } from "@components/ui/page";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "src/core/components/ui/tabs";
import { getIntegrationConfig } from "@services/integrations/integrationConfig/fetch";
import { getConnections } from "@services/setup/fetch";
import { getGlobalSelectedTeamId } from "src/core/utils/get-global-selected-team-id";
import { getCurrentPathnameOnServerComponents } from "src/core/utils/headers";
import { getAutoLicenseAssignmentConfig } from "src/lib/services/organizationParameters/fetch";

import { getOrganizationMembers } from "src/features/ee/subscription/_services/billing/fetch";

import { GitProviders } from "./_components/_providers";
import { GitConnectedProvider } from "./_components/connected-provider";
import { GitRepositoriesTable } from "./_components/table";
import { IgnoredUsersCard } from "./_components/ignored-users-card";

export default async function GitSettings() {
    const teamId = await getGlobalSelectedTeamId();

    const [
        connections,
        connectedRepositories,
        autoLicenseAssignmentConfig,
        organizationMembersRaw,
    ] = await Promise.all([
        getConnections(teamId),
        getIntegrationConfig({ teamId }),
        getAutoLicenseAssignmentConfig(),
        getOrganizationMembers({ teamId }).catch(() => []),
    ]);

    const organizationMembers = Array.isArray(organizationMembersRaw)
        ? organizationMembersRaw.map((member) => {
              const normalizedName =
                  member.name?.trim() ||
                  member.displayName?.trim() ||
                  member.username?.trim() ||
                  member.login?.trim() ||
                  "Unknown member";

              return { id: member.id.toString(), name: normalizedName };
          })
        : [];

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
                <Tabs defaultValue="repositories" className="flex flex-col">
                    <TabsList className="mt-5">
                        <TabsTrigger value="repositories">
                            Repositories
                        </TabsTrigger>
                        <TabsTrigger value="filters">
                            PR author filters
                        </TabsTrigger>
                        <div className="flex-1" />
                    </TabsList>

                    <TabsContent value="repositories">
                        {gitConnection ? (
                            <GitRepositoriesTable
                                platformName={gitConnection.platformName}
                                repositories={connectedRepositories}
                            />
                        ) : (
                            <GitProviders />
                        )}
                    </TabsContent>

                    <TabsContent value="filters" className="max-w-3xl">
                        <IgnoredUsersCard
                            organizationMembers={organizationMembers}
                            autoLicenseAssignmentConfig={
                                autoLicenseAssignmentConfig
                            }
                        />
                    </TabsContent>
                </Tabs>
            </Page.Content>
        </Page.Root>
    );
}

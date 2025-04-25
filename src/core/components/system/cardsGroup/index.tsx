"use client";

import React, { useCallback, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@components/ui/button";
import { Heading } from "@components/ui/heading";
import { SvgAzureRepos } from "@components/ui/icons/SvgAzureRepos";
import { SvgBitbucket } from "@components/ui/icons/SvgBitbucket";
import { SvgDiscord } from "@components/ui/icons/SvgDiscord";
import { SvgGithub } from "@components/ui/icons/SvgGithub";
import { SvgGitlab } from "@components/ui/icons/SvgGitlab";
import { SvgJira } from "@components/ui/icons/SvgJira";
import { SvgSlack } from "@components/ui/icons/SvgSlack";
import { magicModal } from "@components/ui/magic-modal";
import { toast } from "@components/ui/toaster/use-toast";
import { INTEGRATIONS_KEY, type INTEGRATIONS_TYPES } from "@enums";
import { createCodeManagementIntegration } from "@services/codeManagement/fetch";
import {
    checkHasConnectionByPlatform,
    cloneIntegration,
} from "@services/integrations/fetch";
import { getTeamsWithIntegrations } from "@services/teams/fetch";
import { deleteCookie, setCookie } from "cookies-next";
import integrationFactory from "src/core/integrations/integrationFactory";
import { useAllTeams } from "src/core/providers/all-teams-context";
import { AuthMode, PlatformType } from "src/core/types";

import CardConnection from "./cardConnection";
import { BitbucketModal } from "./modals/bitbucket-token";
import { CloneOfferingModal } from "./modals/clone-offering";
import { CloneSelectTeamModal } from "./modals/clone-select-team";
import { OauthOrTokenModal } from "./modals/oauth-or-token";
import TextTopIntegrations from "./textTopIntegrations";

const communicationPlatforms = {
    [INTEGRATIONS_KEY.SLACK]: {
        svg: <SvgSlack />,
        platformName: "Slack",
    },
    [INTEGRATIONS_KEY.DISCORD]: {
        svg: <SvgDiscord />,
        platformName: "Discord",
    },
} satisfies Partial<
    Record<
        INTEGRATIONS_KEY,
        {
            svg: React.ReactNode;
            platformName: string;
        }
    >
>;

const projectManagementPlatforms = {
    [INTEGRATIONS_KEY.JIRA]: {
        svg: <SvgJira />,
        platformName: "Jira",
    },
} satisfies Partial<
    Record<
        INTEGRATIONS_KEY,
        {
            svg: React.ReactNode;
            platformName: string;
        }
    >
>;

const codeManagementPlatforms = {
    [INTEGRATIONS_KEY.GITHUB]: {
        svg: <SvgGithub />,
        platformName: "GitHub",
    },
    [INTEGRATIONS_KEY.GITLAB]: {
        svg: <SvgGitlab />,
        platformName: "Gitlab",
    },
    [INTEGRATIONS_KEY.BITBUCKET]: {
        svg: <SvgBitbucket />,
        platformName: "Bitbucket",
    },
    [INTEGRATIONS_KEY.AZURE_REPOS]: {
        svg: <SvgAzureRepos />,
        platformName: "Azure Repos",
    },
} satisfies Partial<
    Record<
        INTEGRATIONS_KEY,
        {
            svg: React.ReactNode;
            platformName: string;
        }
    >
>;

export default function CardsGroup({
    team,
    connections: connectionsBack,
}: {
    team: ReturnType<typeof useAllTeams>["teams"][number];
    connections: {
        platformName: string;
        isSetupComplete: boolean;
        hasConnection: boolean;
        config?: {
            [key: string]: string;
        };
    }[];
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { teams } = useAllTeams();

    const [connections] = useState<
        Array<{
            key: string;
            isSetupComplete: boolean;
            hasConnection: boolean;
            serviceType: INTEGRATIONS_TYPES;
            config?: Record<string, string>;
        }>
    >(() => {
        const _connections = [
            {
                key: INTEGRATIONS_KEY.GITHUB,
                isSetupComplete: false,
                hasConnection: false,
                serviceType: "codeManagement",
            },
            {
                key: INTEGRATIONS_KEY.GITLAB,
                isSetupComplete: false,
                hasConnection: false,
                serviceType: "codeManagement",
            },
            {
                key: INTEGRATIONS_KEY.AZURE_REPOS,
                isSetupComplete: false,
                hasConnection: false,
                serviceType: "codeManagement",
            },
            {
                key: INTEGRATIONS_KEY.JIRA,
                isSetupComplete: false,
                hasConnection: false,
                serviceType: "projectManagement",
            },
            {
                key: INTEGRATIONS_KEY.SLACK,
                isSetupComplete: false,
                hasConnection: false,
                serviceType: "communication",
            },
            {
                key: INTEGRATIONS_KEY.DISCORD,
                isSetupComplete: false,
                hasConnection: false,
                serviceType: "communication",
            },
            {
                key: INTEGRATIONS_KEY.BITBUCKET,
                isSetupComplete: false,
                hasConnection: false,
                serviceType: "codeManagement",
            },
        ] satisfies Array<{
            key: string;
            isSetupComplete: boolean;
            hasConnection: boolean;
            serviceType: INTEGRATIONS_TYPES;
            config?: Record<string, string>;
        }>;

        const updatedConnections = _connections.map((connection) => {
            const backendInfo = connectionsBack.find(
                (backendItem) =>
                    backendItem.platformName.toUpperCase() ===
                    connection.key.toUpperCase(),
            );

            if (backendInfo) {
                return {
                    ...connection,
                    config: backendInfo.config,
                    isSetupComplete: backendInfo.isSetupComplete,
                    hasConnection: backendInfo.hasConnection,
                };
            }

            return connection;
        });

        return updatedConnections;
    });

    const editIntegration = useCallback((title: string) => {
        const formattedTitle = encodeURIComponent(
            title.toLowerCase().replace(/[\s-]+/g, "-"),
        );

        router.push(`integrations/${formattedTitle}/configuration`);
    }, []);

    // Função para verificar se há conexões desabilitadas por tipo
    const hasDisabledConnectionsByType = useCallback(
        (key: string, serviceType?: string) => {
            if (!serviceType) {
                return false;
            }

            const findConnection = connections.find(
                (connection) =>
                    connection.key.toLowerCase() !== key.toLowerCase() &&
                    connection.serviceType === serviceType &&
                    connection.hasConnection &&
                    !connection.isSetupComplete,
            );

            return !!findConnection || false;
        },
        [connections],
    );

    const connectIntegration = useCallback(
        async (key: string, serviceType?: string) => {
            if (hasDisabledConnectionsByType(key, serviceType)) return;

            const integrationConnector = integrationFactory.getConnector(
                key.toLowerCase(),
            );

            if (!integrationConnector) return;

            const findConnection = connections.find(
                (connection) =>
                    connection.key.toLowerCase() === key.toLowerCase(),
            );

            if (findConnection) {
                await integrationConnector.connect(
                    findConnection.hasConnection,
                    {
                        push: router.push,
                        pathname: pathname,
                    },
                    "",
                    findConnection.config?.url,
                );
            }
        },
        [connections, router.push, pathname, hasDisabledConnectionsByType],
    );

    const openOauthOrTokenModal = async (
        key: INTEGRATIONS_KEY,
        serviceType: INTEGRATIONS_TYPES,
    ) => {
        magicModal.show(() => (
            <OauthOrTokenModal
                integration={key}
                onGoToOauth={async () => {
                    setCookie("selectedTeam", JSON.stringify(team));
                    connectIntegration(key, serviceType);
                }}
                onSaveToken={async (token: string) => {
                    let integrationType: PlatformType = PlatformType.GITHUB;

                    if (key === INTEGRATIONS_KEY.GITHUB) {
                        integrationType = PlatformType.GITHUB;
                    } else if (key === INTEGRATIONS_KEY.GITLAB) {
                        integrationType = PlatformType.GITLAB;
                    }

                    const integrationResponse =
                        await createCodeManagementIntegration({
                            integrationType,
                            authMode: AuthMode.TOKEN,
                            token,
                            organizationAndTeamData: {
                                teamId: team.uuid,
                            },
                        });

                    switch (integrationResponse.data.status) {
                        case "SUCCESS": {
                            editIntegration(key);
                            break;
                        }

                        case "NO_ORGANIZATION": {
                            toast({
                                title: "Integration failed",
                                description:
                                    "Personal accounts are not supported. Try again with an organization.",
                                variant: "danger",
                            });
                            break;
                        }

                        case "NO_REPOSITORIES": {
                            toast({
                                title: "No repositories found",
                                description: (
                                    <div className="mt-4">
                                        <p>Possible reasons:</p>

                                        <ul className="list-inside list-disc">
                                            <li>
                                                No repositories in this account
                                            </li>
                                            <li>Missing permissions</li>
                                        </ul>
                                    </div>
                                ),
                                variant: "danger",
                            });
                            break;
                        }
                    }
                }}
            />
        ));
    };

    const openBitbucketModal = async () => {
        magicModal.show(() => (
            <BitbucketModal
                onSave={async (token: string, username: string) => {
                    const integrationResponse =
                        await createCodeManagementIntegration({
                            integrationType: PlatformType.BITBUCKET,
                            authMode: AuthMode.TOKEN,
                            token,
                            username,
                            organizationAndTeamData: {
                                teamId: team.uuid,
                            },
                        });

                    switch (integrationResponse.data.status) {
                        case "SUCCESS": {
                            editIntegration(INTEGRATIONS_KEY.BITBUCKET);
                            break;
                        }

                        case "NO_ORGANIZATION": {
                            toast({
                                title: "Integration failed",
                                description:
                                    "Personal accounts are not supported. Try again with an organization.",
                                variant: "danger",
                            });
                            break;
                        }
                        case "NO_REPOSITORIES": {
                            toast({
                                title: "No repositories found",
                                description: (
                                    <div className="mt-4">
                                        <p>Possible reasons:</p>

                                        <ul className="list-inside list-disc">
                                            <li>
                                                No repositories in this account
                                            </li>
                                            <li>Missing permissions</li>
                                        </ul>
                                    </div>
                                ),
                                variant: "danger",
                            });
                            break;
                        }
                    }
                }}
            />
        ));
    };

    const openCloneSelectTeamModal = async (
        key: string,
        serviceType: INTEGRATIONS_TYPES,
    ) => {
        const teamsResponse = await getTeamsWithIntegrations();

        if ("error" in teamsResponse) {
            return;
        }

        const teamSelected = await magicModal.show<true>(() => (
            <CloneSelectTeamModal
                teams={teamsResponse.data}
                category={serviceType}
                onCloneIntegration={async (teamIdToClone: string) => {
                    await cloneIntegration(team.uuid, teamIdToClone, {
                        platform: key,
                        category: serviceType,
                    });
                }}
            />
        ));

        if (!teamSelected) {
            return;
        }
        editIntegration(key);
    };

    const handleIntegrationClick = useCallback(
        async (key: INTEGRATIONS_KEY, serviceType: INTEGRATIONS_TYPES) => {
            deleteCookie("selectedTeam");

            const hasConnectionInOrganization =
                await checkHasConnectionByPlatform({
                    platform: key,
                    category: serviceType,
                });

            const findConnection = connections.find(
                (connection) =>
                    connection.key.toLowerCase() === key.toLowerCase(),
            );

            if (!hasConnectionInOrganization) {
                setCookie("selectedTeam", JSON.stringify(team));

                if (key === "github" || key === "gitlab") {
                    await openOauthOrTokenModal(key, serviceType);
                } else if (key === "bitbucket") {
                    await openBitbucketModal();
                } else {
                    await connectIntegration(key, serviceType);
                }
                return;
            }

            if (findConnection?.hasConnection) {
                connectIntegration(key, serviceType);
            } else {
                // handleOpenModal();
                const cloneOrNew = await magicModal.show<"clone" | "new">(
                    CloneOfferingModal,
                );
                if (!cloneOrNew) return;

                if (cloneOrNew === "clone") {
                    await openCloneSelectTeamModal(key, serviceType);
                } else if (cloneOrNew === "new") {
                    if (key === "github" || key === "gitlab") {
                        await openOauthOrTokenModal(key, serviceType);
                    } else if (key === "bitbucket") {
                        await openBitbucketModal();
                    } else {
                        setCookie("selectedTeam", JSON.stringify(team));
                        connectIntegration(key, serviceType);
                    }
                }
            }
        },
        [connections, team, teams, connectIntegration],
    );

    const connectedPlatforms = connections.filter((c) => c.isSetupComplete);

    const connectedCommunicationPlatform = connectedPlatforms.find(
        (c) => c.serviceType === "communication",
    )?.key as keyof typeof communicationPlatforms;

    const connectedCodeManagementPlatform = connectedPlatforms.find(
        (c) => c.serviceType === "codeManagement",
    )?.key as keyof typeof codeManagementPlatforms;

    const connectedProjectManagementPlatform = connectedPlatforms.find(
        (c) => c.serviceType === "projectManagement",
    )?.key as keyof typeof projectManagementPlatforms;

    const wrappedConnectIntegration = (title: string, serviceType?: string) => {
        handleIntegrationClick(
            title as INTEGRATIONS_KEY, // Faz um type assertion
            serviceType as INTEGRATIONS_TYPES, // Faz um type assertion
        );
    };

    const hasProjectOrCodeManagementConnection = (): boolean => {
        return (
            !connectedProjectManagementPlatform &&
            !connectedCodeManagementPlatform
        );
    };

    return (
        <>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                <div>
                    <TextTopIntegrations serviceType="codeManagement" />

                    {connectedCodeManagementPlatform ? (
                        <CardConnection
                            integrationKey={connectedCodeManagementPlatform}
                            svg={
                                codeManagementPlatforms[
                                    connectedCodeManagementPlatform
                                ].svg
                            }
                            title={
                                codeManagementPlatforms[
                                    connectedCodeManagementPlatform
                                ].platformName
                            }
                            isSetupComplete={true}
                            connectIntegration={wrappedConnectIntegration}
                            editIntegration={editIntegration}
                        />
                    ) : (
                        <div className="flex h-full flex-col gap-2 md:min-h-[220px]">
                            {Object.entries(codeManagementPlatforms).map(
                                ([key, connection]) => {
                                    return (
                                        <IntegrationCard
                                            key={key}
                                            connection={{
                                                platformName:
                                                    connection.platformName,
                                                svg: connection.svg,
                                            }}
                                            onClick={() => {
                                                handleIntegrationClick(
                                                    key as INTEGRATIONS_KEY,
                                                    "codeManagement",
                                                );
                                            }}
                                        />
                                    );
                                },
                            )}
                        </div>
                    )}
                </div>

                <div>
                    <TextTopIntegrations serviceType="projectManagement" />

                    {connectedProjectManagementPlatform ? (
                        <CardConnection
                            integrationKey={connectedProjectManagementPlatform}
                            svg={
                                projectManagementPlatforms[
                                    connectedProjectManagementPlatform
                                ].svg
                            }
                            title={
                                projectManagementPlatforms[
                                    connectedProjectManagementPlatform
                                ].platformName
                            }
                            isSetupComplete={true}
                            connectIntegration={wrappedConnectIntegration}
                            editIntegration={editIntegration}
                        />
                    ) : (
                        <div className="flex h-full flex-col gap-2 md:min-h-[220px]">
                            {Object.entries(projectManagementPlatforms).map(
                                ([key, connection]) => {
                                    return (
                                        <IntegrationCard
                                            key={key}
                                            connection={{
                                                platformName:
                                                    connection.platformName,
                                                svg: connection.svg,
                                            }}
                                            onClick={() => {
                                                handleIntegrationClick(
                                                    key as INTEGRATIONS_KEY,
                                                    "projectManagement",
                                                );
                                            }}
                                        />
                                    );
                                },
                            )}
                        </div>
                    )}
                </div>

                <div>
                    <TextTopIntegrations serviceType="communication" />

                    {connectedCommunicationPlatform ? (
                        <CardConnection
                            integrationKey={connectedCommunicationPlatform}
                            svg={
                                communicationPlatforms[
                                    connectedCommunicationPlatform
                                ].svg
                            }
                            title={
                                communicationPlatforms[
                                    connectedCommunicationPlatform
                                ].platformName
                            }
                            isSetupComplete={true}
                            connectIntegration={wrappedConnectIntegration}
                            editIntegration={editIntegration}
                        />
                    ) : (
                        <div className="flex h-full flex-col gap-2 md:min-h-[220px]">
                            {Object.entries(communicationPlatforms).map(
                                ([key, connection]) => {
                                    return (
                                        <IntegrationCard
                                            key={key}
                                            connection={{
                                                platformName:
                                                    connection.platformName,
                                                svg: connection.svg,
                                            }}
                                            disabled={hasProjectOrCodeManagementConnection()}
                                            onClick={() => {
                                                handleIntegrationClick(
                                                    key as INTEGRATIONS_KEY,
                                                    "communication",
                                                );
                                            }}
                                        />
                                    );
                                },
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* <IntegrationModal
                open={isModalOpen}
                onClose={handleCloseModal}
                onNewIntegration={() =>
                    integrationData?.platform && integrationData?.category
                        ? connectIntegration(
                              integrationData.platform,
                              integrationData.category,
                          )
                        : null
                }
                onPendingIntegration={setPendingIntegrationData} // Passar função para setar integração pendente
                refetchConnections={() => router.refresh()}
                teams={teams}
                teamId={team.uuid}
                integrationData={integrationData}
            />
            */}
        </>
    );
}

const IntegrationCard = (props: {
    connection: { platformName: string; svg: React.ReactNode };
    onClick: () => void;
    disabled?: boolean;
}) => {
    return (
        <Button
            size="lg"
            variant="helper"
            className="h-20 w-full justify-start"
            onClick={() => props.onClick()}
            disabled={props.disabled}
            leftIcon={
                <span className="*:size-8!">{props.connection.svg}</span>
            }>
            <Heading variant="h2">{props.connection.platformName}</Heading>
        </Button>
    );
};

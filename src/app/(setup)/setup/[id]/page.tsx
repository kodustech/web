"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@components/ui/button";
import { Heading } from "@components/ui/heading";
import { Icons } from "@components/ui/icons";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Page } from "@components/ui/page";
import { toast } from "@components/ui/toaster/use-toast";
import { INTEGRATIONS_KEY } from "@enums";
import { useEffectOnce } from "@hooks/use-effect-once";
import { useReactQueryInvalidateQueries } from "@hooks/use-invalidate-queries";
import { createCodeManagementIntegration } from "@services/codeManagement/fetch";
import {
    postDiscordAuthIntegration,
    postSlackAuthIntegration,
} from "@services/communication/fetch";
import { createProjectManagementIntegration } from "@services/projectManagement/fetch";
import { SETUP_PATHS } from "@services/setup";
import { saveOrganizationNameGithub } from "@services/setup/fetch";
import { useGetGithubOrganizationName } from "@services/setup/hooks";
import { deleteCookie, getCookie } from "cookies-next";
import { useAuth } from "src/core/providers/auth.provider";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";
import { PlatformType } from "src/core/types";
import { ClientSideCookieHelpers } from "src/core/utils/cookie";
import { captureSegmentEvent } from "src/core/utils/segment";
import { useOrganizationContext } from "src/features/organization/_providers/organization-context";

type Integration = (typeof INTEGRATIONS_KEY)[keyof typeof INTEGRATIONS_KEY];

export default function Redirect() {
    const [integration, setIntegration] = useState<Integration | "">("");
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<string>("");
    const [selectedTeamName, setSelectedTeamName] = useState<string | null>(
        null,
    ); // Novo estado para o nome do time
    const [isIntegrating, setIsIntegrating] = useState<boolean>(false); // Novo estado para controlar a integração

    const [inputText, setInputText] = useState<string>("");
    const [error, setError] = useState<boolean>(false);
    const [userTokenError, setUserTokenError] = useState<boolean>(false);
    const searchParams = useSearchParams();

    const { data: organizationName } = useGetGithubOrganizationName();
    const { organizationId } = useOrganizationContext();
    const { teamId } = useSelectedTeamId();

    const params = useParams<{ id: string }>();
    const router = useRouter();
    const { removeQueries, generateQueryKey } =
        useReactQueryInvalidateQueries();

    const { userId } = useAuth();

    const isSetup = useMemo(
        () =>
            ClientSideCookieHelpers("started-setup-from-new-setup-page").has(),
        [],
    );

    useEffectOnce(() => {
        ClientSideCookieHelpers("started-setup-from-new-setup-page").delete();
    });

    const code = searchParams.get("code");
    const installationId = searchParams.get("installation_id");
    const setupAction = searchParams.get("setup_action");

    useEffect(() => {
        const id =
            params.id as (typeof INTEGRATIONS_KEY)[keyof typeof INTEGRATIONS_KEY];

        if (id && Object.values(INTEGRATIONS_KEY).includes(id)) {
            setIntegration(id);
        } else {
            setError(true);
        }
    }, [params]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const selectedTeamCookie = getCookie("selectedTeam") as any;
            const savedTeam =
                selectedTeamCookie &&
                selectedTeamCookie !== "undefined" &&
                selectedTeamCookie !== ""
                    ? (JSON.parse(selectedTeamCookie) as any)
                    : null;

            if (
                savedTeam &&
                savedTeam?.uuid &&
                organizationId &&
                integration &&
                (code || installationId)
            ) {
                setSelectedTeam(savedTeam.uuid);
                setSelectedTeamName(savedTeam.name);
                setShowConfirmation(true);
            } else if (
                teamId &&
                organizationId &&
                integration &&
                (code || installationId)
            ) {
                setShowConfirmation(false);
                setIsIntegrating(true);
                newIntegration();
            }
        }
    }, [teamId, code, installationId, integration, router, organizationId]);

    useEffect(() => {
        if (organizationName) {
            setInputText(organizationName);
        }
    }, [organizationName]);

    const redirectToConfiguration = async (
        integrationKey: Integration,
        teamId: string,
    ) => {
        if (isSetup) {
            removeQueries({
                queryKey: generateQueryKey(SETUP_PATHS.CONNECTIONS),
            });

            return router.replace(`/setup/choosing-repositories`);
        }

        deleteCookie("selectedTeam", { path: "/" });

        ClientSideCookieHelpers("global-selected-team-id").set(teamId);

        router.replace(
            `/settings/integrations/${integrationKey.toLowerCase()}/configuration`,
        );
    };

    const newIntegration = async () => {
        let integrationResponse: any;
        const organizationAndTeamData = {
            organizationId,
            teamId: selectedTeam || teamId,
        };

        if (integration === INTEGRATIONS_KEY.SLACK) {
            const codeFomatted = code ?? "";

            if (organizationId && codeFomatted) {
                integrationResponse = await postSlackAuthIntegration(
                    codeFomatted,
                    organizationAndTeamData,
                );
            }
        } else if (integration === INTEGRATIONS_KEY.DISCORD) {
            const codeFomatted = code ?? "";

            if (organizationId && codeFomatted) {
                integrationResponse = await postDiscordAuthIntegration(
                    codeFomatted,
                    organizationAndTeamData,
                );
            }
        } else if (integration === INTEGRATIONS_KEY.GITHUB) {
            if (organizationId) {
                integrationResponse = await createCodeManagementIntegration({
                    integrationType: PlatformType.GITHUB,
                    code,
                    organizationAndTeamData,
                    installationId,
                });

                captureSegmentEvent({
                    userId: userId!,
                    event: "setup_git_integration_success",
                    properties: {
                        platform: params.id,
                        teamId: teamId,
                    },
                });
            }
        } else if (integration === INTEGRATIONS_KEY.GITLAB) {
            if (organizationId) {
                integrationResponse = await createCodeManagementIntegration({
                    code,
                    integrationType: PlatformType.GITLAB,
                    organizationAndTeamData,
                });

                captureSegmentEvent({
                    userId: userId!,
                    event: "setup_git_integration_success",
                    properties: {
                        platform: params.id,
                        teamId: teamId,
                    },
                });
            }
        } else if (integration === INTEGRATIONS_KEY.JIRA) {
            if (organizationId) {
                integrationResponse = await createProjectManagementIntegration(
                    code,
                    "JIRA",
                    organizationAndTeamData,
                );
            }
        }

        switch (integration) {
            case INTEGRATIONS_KEY.GITHUB: {
                switch (
                    (
                        integrationResponse as Awaited<
                            ReturnType<typeof createCodeManagementIntegration>
                        >
                    ).data.status
                ) {
                    case "SUCCESS": {
                        await redirectToConfiguration(
                            INTEGRATIONS_KEY.GITHUB,
                            selectedTeam,
                        );
                        break;
                    }

                    case "NO_ORGANIZATION": {
                        if (isSetup) {
                            router.replace(
                                "/setup/organization-account-required",
                            );
                        } else {
                            toast({
                                title: "Integration with Github failed",
                                description:
                                    "Personal accounts are not supported. Try again with an organization.",
                                variant: "destructive",
                            });

                            cancelIntegration();
                        }
                        break;
                    }
                    case "NO_REPOSITORIES": {
                        if (isSetup) {
                            router.replace("/setup/no-repositories");
                        } else {
                            toast({
                                title: "No repositories found in Github",
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
                                variant: "destructive",
                            });

                            cancelIntegration();
                        }
                        break;
                    }
                }
            }

            case INTEGRATIONS_KEY.SLACK:
                if (integrationResponse?.success) {
                    await redirectToConfiguration(
                        INTEGRATIONS_KEY.SLACK,
                        selectedTeam,
                    );
                }
                break;

            case INTEGRATIONS_KEY.JIRA:
                if (integrationResponse?.data?.success) {
                    await redirectToConfiguration(
                        INTEGRATIONS_KEY.JIRA,
                        selectedTeam,
                    );
                }
                break;

            case INTEGRATIONS_KEY.MSTEAMS:
                if (integrationResponse?.success) {
                    await redirectToConfiguration(
                        INTEGRATIONS_KEY.MSTEAMS,
                        selectedTeam,
                    );
                }
                break;

            case INTEGRATIONS_KEY.DISCORD:
                if (integrationResponse?.success) {
                    await redirectToConfiguration(
                        INTEGRATIONS_KEY.DISCORD,
                        selectedTeam,
                    );
                }
                break;

            case INTEGRATIONS_KEY.AZUREBOARDS:
                if (integrationResponse?.success) {
                    await redirectToConfiguration(
                        INTEGRATIONS_KEY.AZUREBOARDS,
                        selectedTeam,
                    );
                }
                break;

            case INTEGRATIONS_KEY.GITLAB: {
                switch (
                    (
                        integrationResponse as Awaited<
                            ReturnType<typeof createCodeManagementIntegration>
                        >
                    ).data.status
                ) {
                    case "SUCCESS": {
                        await redirectToConfiguration(
                            INTEGRATIONS_KEY.GITLAB,
                            selectedTeam,
                        );
                        break;
                    }

                    case "NO_ORGANIZATION": {
                        if (isSetup) {
                            router.replace(
                                "/setup/organization-account-required",
                            );
                        } else {
                            toast({
                                title: "Integration with Gitlab failed",
                                description:
                                    "Personal accounts are not supported. Try again with an organization.",
                                variant: "destructive",
                            });

                            cancelIntegration();
                        }
                        break;
                    }
                    case "NO_REPOSITORIES": {
                        if (isSetup) {
                            router.replace("/setup/no-repositories");
                        } else {
                            toast({
                                title: "No repositories found in Gitlab",
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
                                variant: "destructive",
                            });

                            cancelIntegration();
                        }
                        break;
                    }
                }
            }

            case INTEGRATIONS_KEY.AZUREREPOS:
                if (integrationResponse?.success) {
                    await redirectToConfiguration(
                        INTEGRATIONS_KEY.AZUREREPOS,
                        selectedTeam,
                    );
                }
                break;

            default:
                setError(true);
        }
    };

    async function saveOrganizationName() {
        await saveOrganizationNameGithub(
            inputText?.toLocaleLowerCase()?.trim(),
        );
        router.replace("/setup");
    }

    const handleConfirmIntegration = () => {
        setIsIntegrating(true);
        newIntegration();
        setShowConfirmation(false);
    };

    const cancelIntegration = () => {
        setShowConfirmation(false);
        deleteCookie("selectedTeam", { path: "/" });
        ClientSideCookieHelpers("global-selected-team-id").set(teamId);
        router.replace(`/settings/integrations`);
    };

    return (
        <Suspense>
            {(() => {
                if (setupAction === "request")
                    return (
                        <div className="flex h-full flex-col items-center gap-20 md:w-[70%] xl:w-[50%]">
                            <span className="text-center text-[24px] font-semibold">
                                The access request has been sent to the
                                organization&apos;s owner. Before it is
                                accepted, please fill out the field below so
                                that we can complete the process.
                            </span>
                            <div className="w-full">
                                <Label
                                    className="text-[14px] text-[#DFD8F5]"
                                    htmlFor="text">
                                    Please enter the organization&apos;s name
                                    exactly as it appears on GitHub, including
                                    spaces, dashes, or special characters.
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="Organization name"
                                    type="text"
                                    className="mt-2 flex h-12 w-full items-center rounded-[5px] border border-[#6A57A433] bg-[#292031] px-4 text-sm focus-visible:border-[#F5922080] focus-visible:outline-none"
                                    value={inputText}
                                    onChange={(e) =>
                                        setInputText(e.target.value)
                                    }
                                />
                            </div>
                            <Button
                                className="bg-gradient min-h-[50px] w-52 overflow-hidden rounded-[5px] p-[2px] hover:cursor-pointer"
                                disabled={!inputText}
                                onClick={saveOrganizationName}>
                                <div className="flex size-full items-center justify-center gap-2 rounded-[5px] bg-[#14121766] transition-all duration-150 active:bg-[#14121780] hover:bg-[#1412174D]">
                                    <p className="pb-1 text-[18px] font-normal text-white">
                                        Save
                                    </p>
                                </div>
                            </Button>
                        </div>
                    );

                if (userTokenError)
                    return (
                        <div>
                            <div className="flex flex-col gap-16">
                                <span className="text-[26px] font-medium">
                                    It is not possible to connect with your own
                                    user account; please connect with your
                                    organization.
                                </span>
                                <Button
                                    className="bg-gradient min-h-[50px] w-[250px] self-center overflow-hidden rounded-[5px] p-[2px] hover:cursor-pointer"
                                    onClick={() => router.replace("/setup")}>
                                    <div className="flex size-full items-center justify-center gap-2 rounded-[5px] bg-[#14121766] px-6 transition-all duration-150 active:bg-[#14121780] hover:bg-[#1412174D]">
                                        <p className="-mt-1 text-[20px] font-semibold text-white">
                                            Back to setup
                                        </p>
                                    </div>
                                </Button>
                            </div>
                        </div>
                    );

                if (isIntegrating && integration) {
                    return (
                        <Page.Root>
                            <Page.Content className="flex-row items-center justify-center">
                                <Icons.spinner className="size-6 animate-spin" />
                                Connecting {integration}...
                            </Page.Content>
                        </Page.Root>
                    );
                }

                if (showConfirmation) {
                    return (
                        <div className="flex h-full flex-col items-center justify-center">
                            <Heading>Confirm Integration</Heading>
                            <p className="mb-12 text-center text-lg text-muted-foreground">
                                Are you sure you want to proceed with the
                                integration for the team{" "}
                                <strong className="text-white">
                                    {selectedTeamName}
                                </strong>
                                ?
                            </p>

                            <div className="flex space-x-4">
                                <Button
                                    variant="outline"
                                    onClick={() => cancelIntegration()}>
                                    Cancel
                                </Button>

                                <Button onClick={handleConfirmIntegration}>
                                    Save Integration
                                </Button>
                            </div>
                        </div>
                    );
                }

                if (error) {
                    return (
                        <div>
                            <span>Error to connect</span>
                        </div>
                    );
                }
            })()}
        </Suspense>
    );
}

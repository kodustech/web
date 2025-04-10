"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@components/ui/button";
import { Heading } from "@components/ui/heading";
import { SvgBitbucket } from "@components/ui/icons/SvgBitbucket";
import { SvgGithub } from "@components/ui/icons/SvgGithub";
import { SvgGitlab } from "@components/ui/icons/SvgGitlab";
import { SvgKodus } from "@components/ui/icons/SvgKodus";
import { magicModal } from "@components/ui/magic-modal";
import { Page } from "@components/ui/page";
import { Separator } from "@components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { GIT_INTEGRATIONS_KEY } from "@enums";
import { CheckCircle2, ExternalLink } from "lucide-react";
import integrationFactory from "src/core/integrations/integrationFactory";
import { useAuth } from "src/core/providers/auth.provider";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";
import { ClientSideCookieHelpers } from "src/core/utils/cookie";
import { captureSegmentEvent } from "src/core/utils/segment";

import { StepIndicators } from "../_components/step-indicators";
import { useGoToStep } from "../_hooks/use-goto-step";
import { BitbucketTokenModal } from "./_components/modals/bitbucket";
import { GithubTokenModal } from "./_components/modals/github";
import { GitlabTokenModal } from "./_components/modals/gitlab";

export default function App() {
    useGoToStep();

    const router = useRouter();
    const pathname = usePathname();
    const { teamId } = useSelectedTeamId();
    const { userId } = useAuth();

    const connectOauthIntegration = async (
        key: (typeof GIT_INTEGRATIONS_KEY)[keyof typeof GIT_INTEGRATIONS_KEY],
    ) => {
        try {
            ClientSideCookieHelpers("started-setup-from-new-setup-page").set(
                "true",
            );

            await captureSegmentEvent({
                userId: userId!,
                event: "try_setup_git_integration",
                properties: { platform: key, method: "token" },
            });

            await integrationFactory.getConnector(key)?.connect(false, {
                push: router.push,
                pathname,
            });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Page.Root className="mx-auto flex max-h-screen flex-row overflow-hidden p-6">
            <div className="flex flex-10 flex-col justify-center gap-10 rounded-3xl bg-[#231B2E]/35 p-12 backdrop-blur-sm">
                <SvgKodus className="h-8 min-h-8" />

                <div className="flex flex-1 flex-col justify-center gap-10">
                    <Heading variant="h1" className="max-w-60 text-[4vh]">
                        Security and Privacy
                    </Heading>

                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-4 rounded-2xl border bg-card/35 px-6 py-4 text-sm">
                            <CheckCircle2 />
                            <p>No code stored</p>
                        </div>

                        <div className="flex items-center gap-4 rounded-2xl border bg-card/35 px-6 py-4 text-sm">
                            <CheckCircle2 />
                            <p>Full privacy</p>
                        </div>

                        <div className="flex items-center gap-4 rounded-2xl border bg-card/35 px-6 py-4 text-sm">
                            <CheckCircle2 />
                            <p>No AI training</p>
                        </div>
                    </div>

                    <div className="flex max-w-96 flex-col gap-4 rounded-2xl border bg-card/35 px-6 py-5 text-sm text-muted-foreground">
                        <p>
                            One of our clients{" "}
                            <strong className="text-white">
                                reduced PR cycle time
                            </strong>{" "}
                            by <strong className="text-white">50%</strong>,
                            delivering features{" "}
                            <strong className="text-white">2x faster</strong>.
                        </p>
                        <p>What could that mean for your team?</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-14 flex-col items-center justify-center gap-20 p-10">
                <div className="flex max-w-96 flex-1 flex-col justify-center gap-10">
                    <StepIndicators.Root>
                        <StepIndicators.Item status="completed" />
                        <StepIndicators.Item status="active" />
                        <StepIndicators.Item />
                    </StepIndicators.Root>

                    <div className="flex flex-col gap-2">
                        <Heading variant="h2">Connect your Git tool</Heading>

                        <p className="text-sm text-muted-foreground">
                            By connecting, Kody starts automating reviews
                            instantly, saving hours every week.
                        </p>
                    </div>

                    <Tabs
                        defaultValue={GIT_INTEGRATIONS_KEY.GITHUB}
                        className="w-full">
                        <TabsList className="mb-4">
                            <TabsTrigger value={GIT_INTEGRATIONS_KEY.GITHUB}>
                                <div className="flex flex-row items-center gap-2">
                                    <SvgGithub className="size-5" />
                                    Github
                                </div>
                            </TabsTrigger>

                            <TabsTrigger value={GIT_INTEGRATIONS_KEY.GITLAB}>
                                <div className="flex flex-row items-center gap-2">
                                    <SvgGitlab className="size-5" />
                                    Gitlab
                                </div>
                            </TabsTrigger>

                            <TabsTrigger value={GIT_INTEGRATIONS_KEY.BITBUCKET}>
                                <div className="flex flex-row items-center gap-2">
                                    <SvgBitbucket className="size-5" />
                                    Bitbucket
                                </div>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent
                            value={GIT_INTEGRATIONS_KEY.GITHUB}
                            className="flex flex-col gap-2 rounded-3xl border bg-card/50 p-8">
                            <Button
                                variant="default"
                                rightIcon={<ExternalLink />}
                                onClick={() =>
                                    connectOauthIntegration(
                                        GIT_INTEGRATIONS_KEY.GITHUB,
                                    )
                                }>
                                Install Github app
                            </Button>

                            <div className="flex flex-row items-center gap-2">
                                <Separator className="flex-1" />
                                <p className="text-xs text-muted-foreground">
                                    or
                                </p>
                                <Separator className="flex-1" />
                            </div>

                            <Button
                                variant="outline"
                                onClick={async () => {
                                    await captureSegmentEvent({
                                        userId: userId!,
                                        event: "try_setup_git_integration",
                                        properties: {
                                            platform: "github",
                                            method: "token",
                                        },
                                    });

                                    const response =
                                        await magicModal.show<true>(() => (
                                            <GithubTokenModal
                                                teamId={teamId}
                                                userId={userId!}
                                            />
                                        ));

                                    if (!response) {
                                        return;
                                    }

                                    router.push("/setup/choosing-repositories");
                                }}>
                                Connect via token
                            </Button>
                        </TabsContent>

                        <TabsContent
                            value={GIT_INTEGRATIONS_KEY.GITLAB}
                            className="flex flex-col gap-2 rounded-3xl border bg-card/50 p-8">
                            <Button
                                variant="default"
                                rightIcon={<ExternalLink />}
                                onClick={() =>
                                    connectOauthIntegration(
                                        GIT_INTEGRATIONS_KEY.GITLAB,
                                    )
                                }>
                                Install Gitlab app
                            </Button>

                            <div className="flex flex-row items-center gap-2">
                                <Separator className="flex-1" />
                                <p className="text-xs text-muted-foreground">
                                    or
                                </p>
                                <Separator className="flex-1" />
                            </div>

                            <Button
                                variant="outline"
                                onClick={async () => {
                                    await captureSegmentEvent({
                                        userId: userId!,
                                        event: "try_setup_git_integration",
                                        properties: {
                                            platform: "gitlab",
                                            method: "token",
                                        },
                                    });

                                    const response =
                                        await magicModal.show<true>(() => (
                                            <GitlabTokenModal
                                                teamId={teamId}
                                                userId={userId!}
                                            />
                                        ));

                                    if (!response) {
                                        return;
                                    }

                                    router.push("/setup/choosing-repositories");
                                }}>
                                Connect via token
                            </Button>
                        </TabsContent>

                        <TabsContent
                            value={GIT_INTEGRATIONS_KEY.BITBUCKET}
                            className="flex flex-col gap-2 rounded-3xl border bg-card/50 p-8">
                            <Button
                                variant="outline"
                                onClick={async () => {
                                    await captureSegmentEvent({
                                        userId: userId!,
                                        event: "try_setup_git_integration",
                                        properties: {
                                            platform: "bitbucket",
                                            method: "token",
                                        },
                                    });

                                    magicModal.show(() => (
                                        <BitbucketTokenModal
                                            teamId={teamId}
                                            userId={userId!}
                                        />
                                    ));
                                }}>
                                Connect via token
                            </Button>
                        </TabsContent>
                    </Tabs>

                    <p className="px-4 text-center text-xs text-muted-foreground">
                        Kody complies with LGPD, GDPR, and CCPA to ensure your
                        privacy and security.
                    </p>
                </div>

                <div className="flex w-full flex-col gap-6">
                    <Separator />

                    <p className="text-center text-xs text-muted-foreground">
                        Already trusted by top engineering teams to ship better
                        code faster.
                    </p>

                    <div className="flex flex-row justify-center gap-4 opacity-75">
                        <Image
                            width={58}
                            height={20}
                            alt="TrackCo logo"
                            src="/assets/images/trusted-by/track-co.webp"
                        />

                        <Image
                            width={33}
                            height={20}
                            alt="Voltz logo"
                            src="/assets/images/trusted-by/voltz.webp"
                        />

                        <Image
                            width={72}
                            height={20}
                            alt="Ikatec logo"
                            src="/assets/images/trusted-by/ikatec.webp"
                        />

                        <Image
                            width={82}
                            height={20}
                            alt="Sommus logo"
                            src="/assets/images/trusted-by/sommus.webp"
                        />

                        <Image
                            width={80}
                            height={20}
                            alt="OpenCo logo"
                            src="/assets/images/trusted-by/open-co.webp"
                        />
                    </div>
                </div>
            </div>
        </Page.Root>
    );
}

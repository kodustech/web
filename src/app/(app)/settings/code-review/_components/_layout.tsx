"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { Button } from "@components/ui/button";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleIndicator,
    CollapsibleTrigger,
} from "@components/ui/collapsible";
import { magicModal } from "@components/ui/magic-modal";
import { Page } from "@components/ui/page";
import { Separator } from "@components/ui/separator";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubItem,
} from "@components/ui/sidebar";
import type { TeamAutomation } from "@services/automations/types";
import {
    useSuspenseGetCodeReviewParameter,
    useSuspenseGetParameterPlatformConfigs,
} from "@services/parameters/hooks";
import { KodyLearningStatus } from "@services/parameters/types";
import { Plus } from "lucide-react";

import {
    AutomationCodeReviewConfigProvider,
    PlatformConfigProvider,
} from "./context";
import { AddRepoModal } from "./pages/kody-rules/_components/addRepoModal";

const routes = [
    { label: "General", href: "general" },
    { label: "Suggestion Control", href: "suggestion-control" },
    { label: "PR Summary", href: "pr-summary" },
    { label: "Kody Rules", href: "kody-rules" },
] satisfies Array<{ label: string; href: string }>;

export const AutomationCodeReviewLayout = ({
    children,
    automation,
    teamId,
}: React.PropsWithChildren & {
    automation: TeamAutomation | undefined;
    teamId: string;
}) => {
    const router = useRouter();
    const pathname = usePathname();

    const { configValue } = useSuspenseGetCodeReviewParameter(teamId);
    const { params: [repositoryParam, pageNameParam] = [] } = useParams<{
        params: [string, string];
    }>();

    const platformConfig = useSuspenseGetParameterPlatformConfigs(teamId);

    if (!automation) return null;
    if (!configValue) return null;
    if (!platformConfig) return null;

    const addNewRepo = async () => {
        magicModal.show(() => (
            <AddRepoModal
                codeReviewGlobalConfig={configValue?.global}
                repositories={configValue?.repositories}
                teamId={teamId}
            />
        ));
    };

    return (
        <div className="flex flex-1 flex-row overflow-hidden">
            <Sidebar>
                <SidebarContent className="gap-4">
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu className="flex flex-col gap-1">
                                <SidebarMenuItem>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        selected={pathname.startsWith(
                                            "/settings/integrations",
                                        )}
                                        className="w-full justify-start"
                                        onClick={() => {
                                            router.push(
                                                "/settings/integrations",
                                            );
                                        }}>
                                        Integrations
                                    </Button>
                                </SidebarMenuItem>

                                <SidebarMenuItem>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        selected={
                                            pathname ===
                                            "/settings/subscription"
                                        }
                                        className="w-full justify-start"
                                        onClick={() => {
                                            router.push(
                                                "/settings/subscription",
                                            );
                                        }}>
                                        Subscription
                                    </Button>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>

                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu className="flex flex-col gap-6">
                                <SidebarMenuItem>
                                    <p className="px-2 pb-3 font-semibold">
                                        Global
                                    </p>
                                    <SidebarMenuSub>
                                        <SidebarMenuSubItem className="flex flex-col gap-1">
                                            {routes.map(({ label, href }) => (
                                                <Button
                                                    key={label}
                                                    size="sm"
                                                    variant="ghost"
                                                    selected={
                                                        repositoryParam ===
                                                            "global" &&
                                                        pageNameParam === href
                                                    }
                                                    className="w-full justify-start"
                                                    onClick={() => {
                                                        router.push(
                                                            `/settings/code-review/global/${href}`,
                                                        );
                                                    }}>
                                                    {label}
                                                </Button>
                                            ))}
                                        </SidebarMenuSubItem>
                                    </SidebarMenuSub>
                                </SidebarMenuItem>

                                <SidebarMenuItem>
                                    <div className="px-2 pb-2 font-semibold">
                                        <div className="flex items-center justify-between">
                                            <strong>Per repository</strong>
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                className="size-8"
                                                onClick={addNewRepo}
                                                disabled={
                                                    platformConfig.configValue
                                                        .kodyLearningStatus ===
                                                    KodyLearningStatus.GENERATING_CONFIG
                                                }>
                                                <Plus className="size-4" />
                                            </Button>
                                        </div>
                                        <span className="mb-2 mt-2 block text-muted-foreground">
                                            Set custom configurations for each
                                            repository (override global
                                            defaults).
                                        </span>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        {configValue?.repositories
                                            ?.filter(
                                                (repository) =>
                                                    repository.isSelected,
                                            )
                                            .map((repository) => (
                                                <Collapsible
                                                    key={repository.id}
                                                    className="group/collapsible"
                                                    defaultOpen={
                                                        repositoryParam ===
                                                        repository.id
                                                    }>
                                                    <CollapsibleTrigger asChild>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-auto min-h-9 w-full justify-start py-2"
                                                            selected={routes.some(
                                                                ({ href }) =>
                                                                    repositoryParam ===
                                                                        repository.id &&
                                                                    pageNameParam ===
                                                                        href,
                                                            )}
                                                            leftIcon={
                                                                <CollapsibleIndicator className="group-data-[state=closed]/collapsible:rotate-[-90deg] group-data-[state=open]/collapsible:rotate-0" />
                                                            }>
                                                            {repository.name}
                                                        </Button>
                                                    </CollapsibleTrigger>

                                                    <CollapsibleContent className="group-data-[state=closed]/collapsible:animate-collapsible-up group-data-[state=open]/collapsible:animate-collapsible-down">
                                                        <SidebarMenuSub>
                                                            <SidebarMenuSubItem className="flex flex-col gap-1">
                                                                {routes.map(
                                                                    ({
                                                                        label,
                                                                        href,
                                                                    }) => (
                                                                        <Button
                                                                            key={
                                                                                label
                                                                            }
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            selected={
                                                                                repositoryParam ===
                                                                                    repository.id &&
                                                                                pageNameParam ===
                                                                                    href
                                                                            }
                                                                            className="w-full justify-start"
                                                                            onClick={() => {
                                                                                router.push(
                                                                                    `/settings/code-review/${repository.id}/${href}`,
                                                                                );
                                                                            }}>
                                                                            {
                                                                                label
                                                                            }
                                                                        </Button>
                                                                    ),
                                                                )}
                                                            </SidebarMenuSubItem>
                                                        </SidebarMenuSub>
                                                    </CollapsibleContent>
                                                </Collapsible>
                                            ))}
                                    </div>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>

            <Separator orientation="vertical" />

            <Page.WithSidebar>
                <AutomationCodeReviewConfigProvider
                    config={configValue}
                    key={teamId}>
                    <PlatformConfigProvider config={platformConfig.configValue}>
                        {children}
                    </PlatformConfigProvider>
                </AutomationCodeReviewConfigProvider>
            </Page.WithSidebar>
        </div>
    );
};

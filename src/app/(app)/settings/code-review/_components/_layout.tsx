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

const mainRoutes = [
    {
        label: "Integrations",
        href: "/settings/integrations",
    },
    {
        label: "Subscription",
        href: "/settings/subscription",
    },
] satisfies Array<{ label: string; href: string }>;

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
            <Sidebar className="bg-card-lv1 px-0 py-0">
                <SidebarContent className="gap-4 px-6 py-6">
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu className="flex flex-col gap-1">
                                {mainRoutes.map((route) => (
                                    <SidebarMenuItem key={route.href}>
                                        <Button
                                            size="md"
                                            className="w-full justify-start"
                                            active={pathname === route.href}
                                            onClick={() =>
                                                router.push(route.href)
                                            }
                                            variant={
                                                pathname.startsWith(route.href)
                                                    ? "helper"
                                                    : "cancel"
                                            }>
                                            {route.label}
                                        </Button>
                                    </SidebarMenuItem>
                                ))}
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
                                            {routes.map(({ label, href }) => {
                                                const active =
                                                    repositoryParam ===
                                                        "global" &&
                                                    pageNameParam === href;

                                                return (
                                                    <Button
                                                        key={label}
                                                        size="md"
                                                        variant={
                                                            active
                                                                ? "helper"
                                                                : "cancel"
                                                        }
                                                        active={active}
                                                        className="w-full justify-start"
                                                        onClick={() => {
                                                            router.push(
                                                                `/settings/code-review/global/${href}`,
                                                            );
                                                        }}>
                                                        {label}
                                                    </Button>
                                                );
                                            })}
                                        </SidebarMenuSubItem>
                                    </SidebarMenuSub>
                                </SidebarMenuItem>

                                <SidebarMenuItem>
                                    <div className="px-2 pb-2 font-semibold">
                                        <div className="flex items-center justify-between">
                                            <strong>Per repository</strong>
                                            <Button
                                                size="icon-sm"
                                                variant="secondary"
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
                                        <span className="text-text-secondary mt-2 mb-2 block max-w-52">
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
                                            .map((repository) => {
                                                const active = routes.some(
                                                    ({ href }) =>
                                                        repositoryParam ===
                                                            repository.id &&
                                                        pageNameParam === href,
                                                );

                                                return (
                                                    <Collapsible
                                                        key={repository.id}
                                                        className="group/collapsible"
                                                        defaultOpen={
                                                            repositoryParam ===
                                                            repository.id
                                                        }>
                                                        <CollapsibleTrigger
                                                            asChild>
                                                            <Button
                                                                size="md"
                                                                variant={
                                                                    active
                                                                        ? "helper"
                                                                        : "cancel"
                                                                }
                                                                className="h-fit w-full justify-start py-2"
                                                                active={active}
                                                                leftIcon={
                                                                    <CollapsibleIndicator className="group-data-[state=closed]/collapsible:rotate-[-90deg] group-data-[state=open]/collapsible:rotate-0" />
                                                                }>
                                                                {
                                                                    repository.name
                                                                }
                                                            </Button>
                                                        </CollapsibleTrigger>

                                                        <CollapsibleContent className="group-data-[state=closed]/collapsible:animate-collapsible-up group-data-[state=open]/collapsible:animate-collapsible-down">
                                                            <SidebarMenuSub>
                                                                <SidebarMenuSubItem className="flex flex-col gap-1">
                                                                    {routes.map(
                                                                        ({
                                                                            label,
                                                                            href,
                                                                        }) => {
                                                                            const active =
                                                                                repositoryParam ===
                                                                                    repository.id &&
                                                                                pageNameParam ===
                                                                                    href;

                                                                            return (
                                                                                <Button
                                                                                    key={
                                                                                        label
                                                                                    }
                                                                                    size="md"
                                                                                    variant={
                                                                                        active
                                                                                            ? "helper"
                                                                                            : "cancel"
                                                                                    }
                                                                                    active={
                                                                                        active
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
                                                                            );
                                                                        },
                                                                    )}
                                                                </SidebarMenuSubItem>
                                                            </SidebarMenuSub>
                                                        </CollapsibleContent>
                                                    </Collapsible>
                                                );
                                            })}
                                    </div>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>

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

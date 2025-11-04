"use client";

import { useMemo } from "react";
import { redirect, usePathname } from "next/navigation";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleIndicator,
    CollapsibleTrigger,
} from "@components/ui/collapsible";
import { Link } from "@components/ui/link";
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
import {
    useSuspenseGetCodeReviewParameter,
    useSuspenseGetDefaultCodeReviewParameter,
    useSuspenseGetFormattedCodeReviewParameter,
    useSuspenseGetParameterPlatformConfigs,
} from "@services/parameters/hooks";
import { usePermission } from "@services/permissions/hooks";
import { Action, ResourceType } from "@services/permissions/types";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";

import { useCodeReviewRouteParams } from "../_hooks";
import { FormattedConfigLevel } from "../code-review/_types";
import { countConfigOverrides } from "../_utils/count-overrides";
import {
    AutomationCodeReviewConfigProvider,
    DefaultCodeReviewConfigProvider,
    PlatformConfigProvider,
} from "./context";
import { PerRepository } from "./per-repository/repository";

const routes = [
    { label: "General", href: "general" },
    { label: "Review Categories", href: "review-categories" },
    { label: "Custom Prompts", href: "custom-prompts" },
    { label: "Suggestion Control", href: "suggestion-control" },
    { label: "PR Summary", href: "pr-summary" },
    { label: "Kody Rules", href: "kody-rules" },
    { label: "Custom Messages", href: "custom-messages" },
] satisfies Array<{ label: string; href: string }>;

export const SettingsLayout = ({ children }: React.PropsWithChildren) => {
    const pathname = usePathname();
    const { teamId } = useSelectedTeamId();
    const { configValue } = useSuspenseGetFormattedCodeReviewParameter(teamId);
    const defaultConfig = useSuspenseGetDefaultCodeReviewParameter();
    const platformConfig = useSuspenseGetParameterPlatformConfigs(teamId);
    const { repositoryId, pageName, directoryId } = useCodeReviewRouteParams();

    const globalOverrideCount = countConfigOverrides(configValue.configs, FormattedConfigLevel.GLOBAL);

    const canReadGitSettings = usePermission(
        Action.Read,
        ResourceType.GitSettings,
    );
    const canReadBilling = usePermission(Action.Read, ResourceType.Billing);
    const canReadPlugins = usePermission(
        Action.Read,
        ResourceType.PluginSettings,
    );

    const mainRoutes = useMemo(() => {
        const routes: Array<{
            label: string;
            href: string;
            badge?: React.ReactNode;
        }> = [];

        if (canReadGitSettings) {
            routes.push({
                label: "Git Settings",
                href: "/settings/git",
            });
        }

        if (canReadBilling) {
            routes.push({
                label: "Subscription",
                href: "/settings/subscription",
            });
        }

        if (canReadPlugins) {
            routes.push({
                label: "Plugins",
                href: "/settings/plugins",
                badge: (
                    <Badge
                        variant="secondary"
                        className="pointer-events-none -my-1 h-6 min-h-auto px-2.5">
                        Alpha
                    </Badge>
                ),
            });
        }

        return routes;
    }, [canReadGitSettings, canReadBilling, canReadPlugins]);

    if (repositoryId && repositoryId !== "global") {
        const repository = configValue?.repositories.find(
            (r) => r.id === repositoryId,
        );

        if (!repository) redirect(`/settings/code-review/global/${pageName}`);

        if (!repository?.isSelected) {
            const directory = repository?.directories?.find(
                (d) => d.id === directoryId,
            );

            if (!directory)
                redirect(`/settings/code-review/global/${pageName}`);
        }
    }

    return (
        <div className="flex flex-1 flex-row overflow-hidden">
            <Sidebar className="bg-card-lv1 px-0 py-0">
                <SidebarContent className="gap-4 px-6 py-6">
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {mainRoutes.map((route) => (
                                    <SidebarMenuItem key={route.href}>
                                        <Link
                                            href={route.href}
                                            className="w-full">
                                            <Button
                                                size="md"
                                                decorative
                                                className="w-full justify-start"
                                                active={pathname === route.href}
                                                rightIcon={route.badge}
                                                variant={
                                                    pathname.startsWith(
                                                        route.href,
                                                    )
                                                        ? "helper"
                                                        : "cancel"
                                                }>
                                                {route.label}
                                            </Button>
                                        </Link>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>

                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu className="gap-6">
                                <Collapsible
                                    defaultOpen={
                                        repositoryId === "global" ||
                                        !repositoryId
                                    }>
                                    <CollapsibleTrigger asChild>
                                        <Button
                                            size="md"
                                            variant="helper"
                                            className="h-fit w-full justify-start py-2"
                                            leftIcon={
                                                <CollapsibleIndicator className="-ml-1 group-data-[state=closed]/collapsible:rotate-[-90deg] group-data-[state=open]/collapsible:rotate-0" />
                                            }
                                            rightIcon={
                                                globalOverrideCount > 0 && (
                                                    <Badge
                                                        variant="primary-dark"
                                                        className="min-w-5 h-5 rounded-full px-1.5 text-[10px] font-medium">
                                                        {globalOverrideCount}
                                                    </Badge>
                                                )
                                            }>
                                            Global
                                        </Button>
                                    </CollapsibleTrigger>

                                    <CollapsibleContent>
                                        <SidebarMenuItem>
                                            <SidebarMenuSub>
                                                {routes.map(
                                                    ({ label, href }) => {
                                                        const active =
                                                            repositoryId ===
                                                                "global" &&
                                                            pageName === href;

                                                        return (
                                                            <SidebarMenuSubItem
                                                                key={label}>
                                                                <Link
                                                                    className="w-full"
                                                                    href={`/settings/code-review/global/${href}`}>
                                                                    <Button
                                                                        decorative
                                                                        size="sm"
                                                                        variant="cancel"
                                                                        active={
                                                                            active
                                                                        }
                                                                        className="min-h-auto w-full justify-start px-0 py-2">
                                                                        {label}
                                                                    </Button>
                                                                </Link>
                                                            </SidebarMenuSubItem>
                                                        );
                                                    },
                                                )}
                                            </SidebarMenuSub>
                                        </SidebarMenuItem>
                                    </CollapsibleContent>
                                </Collapsible>

                                <PerRepository
                                    routes={routes}
                                    configValue={configValue}
                                    platformConfig={platformConfig}
                                />
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>

            <Page.WithSidebar>
                <DefaultCodeReviewConfigProvider config={defaultConfig}>
                    <AutomationCodeReviewConfigProvider config={configValue}>
                        <PlatformConfigProvider
                            config={platformConfig.configValue}>
                            {children}
                        </PlatformConfigProvider>
                    </AutomationCodeReviewConfigProvider>
                </DefaultCodeReviewConfigProvider>
            </Page.WithSidebar>
        </div>
    );
};

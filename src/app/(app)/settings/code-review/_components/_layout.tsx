"use client";

import { useMemo } from "react";
import { useParams, usePathname } from "next/navigation";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleIndicator,
    CollapsibleTrigger,
} from "@components/ui/collapsible";
import { Link } from "@components/ui/link";
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
import type { LiteralUnion } from "src/core/types";
import type { getFeatureFlagWithPayload } from "src/core/utils/posthog-server-side";

import {
    AutomationCodeReviewConfigProvider,
    PlatformConfigProvider,
} from "./context";
import { AddRepoModal } from "./pages/kody-rules/_components/addRepoModal";
import { PerRepository } from "./per-repository";

const routes = [
    { label: "General", href: "general" },
    { label: "Suggestion Control", href: "suggestion-control" },
    { label: "PR Summary", href: "pr-summary" },
    { label: "Kody Rules", href: "kody-rules" },
    { label: "Custom Messages", href: "custom-messages" },
] satisfies Array<{ label: string; href: string }>;

export const AutomationCodeReviewLayout = ({
    children,
    automation,
    teamId,
    pluginsPageFeatureFlag,
}: React.PropsWithChildren & {
    automation: TeamAutomation | undefined;
    teamId: string;
    pluginsPageFeatureFlag: Awaited<
        ReturnType<typeof getFeatureFlagWithPayload>
    >;
}) => {
    const pathname = usePathname();

    const { configValue } = useSuspenseGetCodeReviewParameter(teamId);
    const { params: [repositoryParam, pageNameParam] = [] } = useParams<{
        params: [LiteralUnion<"global">, string];
    }>();

    const mainRoutes = useMemo(() => {
        const routes: Array<{
            label: string;
            href: string;
            badge?: React.ReactNode;
        }> = [
            {
                label: "Git Settings",
                href: "/settings/git",
            },
            {
                label: "Subscription",
                href: "/settings/subscription",
            },
        ];

        if (pluginsPageFeatureFlag?.value) {
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
    }, [pluginsPageFeatureFlag?.value]);

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
                                        repositoryParam === "global" ||
                                        !repositoryParam
                                    }>
                                    <CollapsibleTrigger asChild>
                                        <Button
                                            size="md"
                                            variant="helper"
                                            className="h-fit w-full justify-start py-2"
                                            leftIcon={
                                                <CollapsibleIndicator className="-ml-1 group-data-[state=closed]/collapsible:rotate-[-90deg] group-data-[state=open]/collapsible:rotate-0" />
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
                                                            repositoryParam ===
                                                                "global" &&
                                                            pageNameParam ===
                                                                href;

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
                                    addNewRepo={addNewRepo}
                                    configValue={configValue}
                                    pageNameParam={pageNameParam}
                                    repositoryParam={repositoryParam}
                                    platformConfig={platformConfig}
                                    teamId={teamId}
                                />
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

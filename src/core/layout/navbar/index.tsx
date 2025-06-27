"use client";

import { Suspense, useMemo } from "react";
import dynamic from "next/dynamic";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { SvgKodus } from "@components/ui/icons/SvgKodus";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from "@components/ui/navigation-menu";
import { Spinner } from "@components/ui/spinner";
import { GaugeIcon, InfoIcon, SlidersHorizontalIcon } from "lucide-react";
import { UserNav } from "src/core/layout/navbar/_components/user-nav";
import { useAuth } from "src/core/providers/auth.provider";
import { cn } from "src/core/utils/components";
import type { getFeatureFlagWithPayload } from "src/core/utils/posthog-server-side";
import { SubscriptionBadge } from "src/features/ee/subscription/_components/subscription-badge";
import { useSubscriptionStatus } from "src/features/ee/subscription/_hooks/use-subscription-status";

import { SupportDropdown } from "./_components/support";

const NoSSRIssuesCount = dynamic(
    () => import("./_components/issues-count").then((f) => f.IssuesCount),
    {
        ssr: false,
        loading: () => (
            <div className="flex size-full items-center justify-center">
                <Spinner className="size-4" />
            </div>
        ),
    },
);

export const NavMenu = ({
    issuesPageFeatureFlag,
}: {
    issuesPageFeatureFlag: Awaited<
        ReturnType<typeof getFeatureFlagWithPayload>
    >;
}) => {
    const pathname = usePathname();
    const { isOwner, isTeamLeader } = useAuth();
    const subscription = useSubscriptionStatus();

    const items = useMemo(() => {
        const items: Array<{
            label: string;
            icon: React.JSX.Element;
            href: string;
            visible: boolean;
            badge?: React.JSX.Element;
        }> = [
            // {
            //     label: "Chat",
            //     icon: <MessageSquareText size={16} />,
            //     href: "/chat",
            //     visible: true,
            // },
            {
                label: "Cockpit",
                href: "/cockpit",
                visible: subscription.valid,
                icon: <GaugeIcon className="size-6" />,
            },

            {
                label: "Code Review Settings",
                icon: <SlidersHorizontalIcon className="size-5" />,
                href: "/settings",
                visible: isOwner || isTeamLeader,
            },
        ];

        if (issuesPageFeatureFlag?.value) {
            items.push({
                label: "Issues",
                href: "/issues",
                visible: isOwner || isTeamLeader,
                icon: <InfoIcon className="size-5" />,
                badge: (
                    <div className="h-5 min-h-auto min-w-8">
                        <NoSSRIssuesCount />
                    </div>
                ),
            });
        }

        return items;
    }, [isOwner, isTeamLeader, issuesPageFeatureFlag?.value]);

    const isActive = (route: string) => pathname.startsWith(route);

    return (
        <div className="border-primary-dark bg-card-lv1 z-50 flex h-16 shrink-0 items-center gap-4 border-b-2 px-6">
            <NextLink href="/">
                <SvgKodus className="h-8 max-w-max" />
            </NextLink>

            <div className="-mb-1 h-full flex-1">
                <NavigationMenu className="h-full *:h-full">
                    <NavigationMenuList className="h-full gap-0">
                        {items.map(({ label, icon, href, visible, badge }) => {
                            if (!visible) return null;

                            return (
                                <NavigationMenuItem
                                    key={label}
                                    className="h-full">
                                    <NavigationMenuLink
                                        href={href}
                                        active={isActive(href)}
                                        className={cn(
                                            "text-text-tertiary relative flex h-full flex-row items-center gap-2 border-b-2 border-transparent px-4 text-sm transition",
                                            "hover:text-white focus-visible:text-white",
                                            "data-active:font-semibold data-active:text-white",
                                            "data-active:border-primary-light",
                                        )}>
                                        {icon}
                                        {label}
                                        {badge}
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                            );
                        })}
                    </NavigationMenuList>
                </NavigationMenu>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <SubscriptionBadge />

                    <SupportDropdown />
                </div>

                <Suspense>
                    <UserNav />
                </Suspense>
            </div>
        </div>
    );
};

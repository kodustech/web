"use client";

import { Suspense } from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@components/ui/badge";
import { SvgKodus } from "@components/ui/icons/SvgKodus";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from "@components/ui/navigation-menu";
import { GaugeIcon, InfoIcon, SlidersHorizontalIcon } from "lucide-react";
import { UserNav } from "src/core/layout/navbar/_components/user-nav";
import { useAuth } from "src/core/providers/auth.provider";
import { cn } from "src/core/utils/components";
import { SubscriptionBadge } from "src/features/ee/subscription/_components/subscription-badge";
import { useSubscriptionStatus } from "src/features/ee/subscription/_hooks/use-subscription-status";

import { SupportDropdown } from "./_components/support";

export const NavMenu = (props: { issuesCount: number }) => {
    const pathname = usePathname();
    const { isOwner, isTeamLeader } = useAuth();
    const subscription = useSubscriptionStatus();

    const items = [
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
            href: "/settings",
            visible: isOwner || isTeamLeader,
            icon: <SlidersHorizontalIcon className="size-5" />,
        },
        {
            label: "Issues",
            href: "/issues",
            visible: isOwner || isTeamLeader,
            icon: <InfoIcon className="size-5" />,
            badge: (
                <Badge
                    variant="secondary"
                    className="pointer-events-none h-5 min-h-auto min-w-8 px-2">
                    {props.issuesCount}
                </Badge>
            ),
        },
    ] satisfies Array<{
        label: string;
        href: `/${string}`;
        visible: boolean;
        icon: React.JSX.Element;
        badge?: React.JSX.Element;
    }>;
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

"use client";

import NextLink from "next/link";
import { Badge } from "@components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { cn } from "src/core/utils/components";
import { useSubscriptionStatus } from "src/features/ee/subscription/_hooks/use-subscription-status";

const commonClassnames = "h-9";

const SubscriptionTrial = () => {
    return (
        <NextLink href="/settings/subscription">
            <Badge
                className={cn(
                    commonClassnames,
                    "bg-brand-red/50 text-brand-red-foreground selected:bg-brand-red/60 hover:bg-brand-red/60",
                )}>
                14 days free trial
            </Badge>
        </NextLink>
    );
};

const SubscriptionUpgrade = () => {
    return (
        <NextLink href="/settings/subscription">
            <Badge
                className={cn(
                    commonClassnames,
                    "bg-brand-orange text-brand-orange-foreground",
                )}>
                Upgrade Subscription
            </Badge>
        </NextLink>
    );
};

const SubscriptionActive = () => {
    return (
        <NextLink href="/settings/subscription">
            <Badge
                className={cn(
                    commonClassnames,
                    "bg-brand-purple/50 text-brand-purple-foreground selected:bg-brand-purple/60 hover:bg-brand-purple/60",
                )}>
                Teams Plan
            </Badge>
        </NextLink>
    );
};

const SubscriptionPaymentFailed = () => {
    return (
        <NextLink href="/settings/subscription">
            <Badge
                leftIcon={<AlertTriangle />}
                variant="destructive"
                className={cn(commonClassnames, "bg-destructive/50")}>
                Payment failed
            </Badge>
        </NextLink>
    );
};

const components: Partial<
    Record<
        ReturnType<typeof useSubscriptionStatus>["status"],
        React.ComponentType
    >
> = {
    "active": SubscriptionActive,
    "trial-active": SubscriptionTrial,
    "trial-expiring": SubscriptionTrial,
    "expired": SubscriptionUpgrade,
    "canceled": SubscriptionUpgrade,
    "payment-failed": SubscriptionPaymentFailed,
};

export const SubscriptionBadge = () => {
    const { status } = useSubscriptionStatus();
    const Component = components[status];

    if (!Component) return null;
    return <Component />;
};

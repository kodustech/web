"use client";

import NextLink from "next/link";
import { Button } from "@components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useSubscriptionStatus } from "src/features/ee/subscription/_hooks/use-subscription-status";

const SubscriptionTrial = () => {
    const subscriptionStatus = useSubscriptionStatus();
    if (
        subscriptionStatus.status !== "trial-active" &&
        subscriptionStatus.status !== "trial-expiring"
    ) {
        return null;
    }

    return (
        <Button size="sm" variant="tertiary">
            {subscriptionStatus.trialDaysLeft} days free trial
        </Button>
    );
};

const SubscriptionUpgrade = () => {
    return (
        <Button size="sm" variant="primary-dark">
            Upgrade Subscription
        </Button>
    );
};

const SubscriptionActive = () => {
    return (
        <Button size="sm" variant="secondary">
            Teams Plan
        </Button>
    );
};

const SubscriptionPaymentFailed = () => {
    return (
        <Button size="sm" leftIcon={<AlertTriangle />} variant="tertiary">
            Payment failed
        </Button>
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
    return (
        <NextLink href="/settings/subscription">
            <Component />
        </NextLink>
    );
};

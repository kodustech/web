"use client";

import { Button } from "@components/ui/button";
import { Link } from "@components/ui/link";
import { AlertTriangle } from "lucide-react";
import { useSubscriptionStatus } from "src/features/ee/subscription/_hooks/use-subscription-status";
import { capturePosthogEvent } from "src/core/utils/posthog-client";

const SubscriptionTrial = () => {
    const subscriptionStatus = useSubscriptionStatus();
    if (
        subscriptionStatus.status !== "trial-active" &&
        subscriptionStatus.status !== "trial-expiring"
    ) {
        return null;
    }

    return (
        <Button decorative size="sm" variant="tertiary">
            {subscriptionStatus.trialDaysLeft} days free trial
        </Button>
    );
};

const SubscriptionUpgrade = () => {
    return (
        <Button decorative size="sm" variant="primary-dark">
            Upgrade Subscription
        </Button>
    );
};

const SubscriptionActive = () => {
    return (
        <Button decorative size="sm" variant="secondary">
            Teams Plan
        </Button>
    );
};

const SubscriptionPaymentFailed = () => {
    return (
        <Button
            decorative
            size="sm"
            leftIcon={<AlertTriangle />}
            variant="tertiary">
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
    "free": SubscriptionUpgrade,
    "canceled": SubscriptionUpgrade,
    "payment-failed": SubscriptionPaymentFailed,
};

export const SubscriptionBadge = () => {
    const { status } = useSubscriptionStatus();
    const Component = components[status];

    if (!Component) return null;
    const isUpgradeStatus =
        status === "free" ||
        status === "canceled" ||
        status === "trial-active" ||
        status === "trial-expiring";
    const eventName =
        status === "trial-active" || status === "trial-expiring"
            ? "trial_badge_clicked"
            : "upgrade_clicked";
    return (
        <Link
            href="/settings/subscription"
            onClick={
                isUpgradeStatus
                    ? () => {
                          capturePosthogEvent({
                              event: eventName,
                              properties: {
                                  feature: "subscription_badge",
                                  status,
                              },
                          });
                      }
                    : undefined
            }>
            <Component />
        </Link>
    );
};

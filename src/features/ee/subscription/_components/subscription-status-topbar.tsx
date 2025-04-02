"use client";

import { Link } from "@components/ui/link";
import { useSubscriptionStatus } from "src/features/ee/subscription/_hooks/use-subscription-status";

const TrialExpiring = () => {
    return (
        <div className="bg-brand-red/30 py-2 text-center text-sm text-brand-red-foreground">
            Your free trial is expiring soon...{" "}
            <Link href="/settings/subscription" className="font-bold">
                Upgrade
            </Link>{" "}
            the subscription to keep all features.
        </div>
    );
};

const SubscriptionInvalid = () => {
    return (
        <div className="bg-brand-red/30 py-2 text-center text-sm text-brand-red-foreground">
            Kody's off duty!{" "}
            <Link href="/settings/subscription" className="font-bold">
                Upgrade
            </Link>{" "}
            subscription to bring her back to work.
        </div>
    );
};

const components: Partial<
    Record<
        ReturnType<typeof useSubscriptionStatus>["status"],
        React.ComponentType
    >
> = {
    "trial-expiring": TrialExpiring,
    "expired": SubscriptionInvalid,
    "canceled": SubscriptionInvalid,
    "payment-failed": SubscriptionInvalid,
};

export const SubscriptionStatusTopbar = () => {
    const { status } = useSubscriptionStatus();
    const Component = components[status];

    if (!Component) return null;
    return (
        <div>
            <Component />
        </div>
    );
};

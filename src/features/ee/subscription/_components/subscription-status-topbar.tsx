"use client";

import { Link } from "@components/ui/link";
import { useSubscriptionStatus } from "src/features/ee/subscription/_hooks/use-subscription-status";
import { capturePosthogEvent } from "src/core/utils/posthog-client";

const TrialExpiring = () => {
    return (
        <div className="bg-danger/30 py-2 text-center text-sm">
            Your free trial is expiring soon...{" "}
            <Link
                href="/settings/subscription"
                className="font-bold"
                onClick={() => {
                    capturePosthogEvent({
                        event: "upgrade_clicked",
                        properties: {
                            feature: "subscription_status_topbar",
                            status: "trial-expiring",
                        },
                    });
                }}>
                Upgrade
            </Link>{" "}
            the subscription to keep all features.
        </div>
    );
};

const SubscriptionInvalid = ({
    status,
}: {
    status: "expired" | "canceled" | "payment-failed";
}) => {
    return (
        <div className="bg-danger/30 py-2 text-center text-sm">
            Kody's off duty!{" "}
            <Link
                href="/settings/subscription"
                className="font-bold"
                onClick={() => {
                    capturePosthogEvent({
                        event: "upgrade_clicked",
                        properties: {
                            feature: "subscription_status_topbar",
                            status,
                        },
                    });
                }}>
                Upgrade
            </Link>{" "}
            subscription to bring her back to work.
        </div>
    );
};

export const SubscriptionStatusTopbar = () => {
    const { status } = useSubscriptionStatus();

    if (status === "trial-expiring") {
        return (
            <div>
                <TrialExpiring />
            </div>
        );
    }

    if (
        status === "expired" ||
        status === "canceled" ||
        status === "payment-failed"
    ) {
        return (
            <div>
                <SubscriptionInvalid status={status} />
            </div>
        );
    }

    return null;
};

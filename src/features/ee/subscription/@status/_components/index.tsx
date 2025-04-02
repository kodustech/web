"use client";

import type { TeamMembersResponse } from "@services/setup/types";
import { useSubscriptionStatus } from "src/features/ee/subscription/_hooks/use-subscription-status";

import { Active } from "./active";
import { Canceled } from "./canceled";
import { TrialExpired } from "./no-subscription";
import { PaymentFailed } from "./payment-failed";
import { Trial } from "./trial";

const components: Partial<
    Record<
        ReturnType<typeof useSubscriptionStatus>["status"],
        React.ComponentType<any>
    >
> = {
    "active": Active,
    "trial-active": Trial,
    "trial-expiring": Trial,
    "expired": TrialExpired,
    "canceled": Canceled,
    "payment-failed": PaymentFailed,
};

export const Redirect = ({
    members,
}: {
    members: TeamMembersResponse["members"];
}) => {
    const { status } = useSubscriptionStatus();
    const Component = components[status];

    if (!Component) return null;
    return <Component members={members} />;
};

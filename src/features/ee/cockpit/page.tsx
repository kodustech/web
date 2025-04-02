import { redirect } from "next/navigation";

import { useSubscriptionStatus } from "../subscription/_hooks/use-subscription-status";

export default function CockpitPage() {
    const subscription = useSubscriptionStatus();
    if (!subscription.valid) redirect("/settings");
    return null;
}

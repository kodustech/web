import { redirect } from "next/navigation";

export default function CancelSubscription() {
    redirect("/settings/subscription");
}

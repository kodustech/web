"use client";

import { useRouter } from "next/navigation";
import { Button } from "@components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@components/ui/dialog";
import { Link } from "@components/ui/link";
import { MagicModalContext } from "@components/ui/magic-modal";
import { useAsyncAction } from "@hooks/use-async-action";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";
import { ClientSideCookieHelpers } from "src/core/utils/cookie";
import { useSubscriptionStatus } from "src/features/ee/subscription/_hooks/use-subscription-status";

import { createCheckoutSessionAction } from "../_actions/create-checkout-session";

export const FinishedTrialModal = () => {
    const { teamId } = useSelectedTeamId();
    const router = useRouter();
    const subscription = useSubscriptionStatus();

    if (subscription.status !== "expired") return null;

    const cookie = ClientSideCookieHelpers("trial-finished-modal-closed");
    if (cookie.has()) return null;

    const [createLinkToCheckout, { loading: isCreatingLinkToCheckout }] =
        useAsyncAction(async () => {
            const { url } = await createCheckoutSessionAction({ teamId });
            window.location.href = url;
        });

    return (
        <MagicModalContext.Provider value={{ closeable: false }}>
            <Dialog open>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Your PRO Trial has ended...</DialogTitle>
                    </DialogHeader>

                    <div className="text-text-secondary flex flex-col gap-6 text-sm">
                        <p>
                            Your subscription will be downgraded to Basic and
                            Kody won’t work at its maximum.
                        </p>

                        <p>
                            You can still Upgrade subscription or{" "}
                            <Link
                                target="_blank"
                                href={
                                    process.env
                                        .WEB_SUPPORT_TALK_TO_FOUNDER_URL ?? ""
                                }>
                                talk with our team
                            </Link>{" "}
                            to ask questions or extend trial.
                        </p>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                cookie.set("true");
                                router.refresh();
                            }}>
                            Stop using Kody
                        </Button>

                        <Button
                            loading={isCreatingLinkToCheckout}
                            onClick={() => createLinkToCheckout()}>
                            Upgrade subscription
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </MagicModalContext.Provider>
    );
};

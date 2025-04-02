import { Button } from "@components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@components/ui/dialog";
import { magicModal } from "@components/ui/magic-modal";
import { useAsyncAction } from "@hooks/use-async-action";
import { CircleDollarSign } from "lucide-react";

import { createManageBillingLinkAction } from "../../_actions/create-manage-billing-link";

export const NoMoreLicensesModal = ({ teamId }: { teamId: string }) => {
    const [
        createLinkToManageBilling,
        { loading: isCreatingLinkToManageBilling },
    ] = useAsyncAction(async () => {
        const { url } = await createManageBillingLinkAction({ teamId });
        window.location.href = url;
    });

    return (
        <Dialog open onOpenChange={() => magicModal.hide()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>You need more licenses</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-6 text-sm text-muted-foreground">
                    Update your plan licences to assign more devs.
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => magicModal.hide()}>
                        Cancel
                    </Button>

                    <Button
                        leftIcon={<CircleDollarSign />}
                        loading={isCreatingLinkToManageBilling}
                        onClick={() => createLinkToManageBilling()}>
                        Manage licenses
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

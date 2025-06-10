"use client";

import { useState } from "react";
import { Button } from "@components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@components/ui/dialog";
import { magicModal } from "@components/ui/magic-modal";
import { toast } from "@components/ui/toaster/use-toast";
import { useAsyncAction } from "@hooks/use-async-action";
import { useReactQueryInvalidateQueries } from "@hooks/use-invalidate-queries";
import { useTimeout } from "@hooks/use-timeout";
import { deleteIntegration } from "@services/codeManagement/fetch";
import { INTEGRATION_CONFIG } from "@services/integrations/integrationConfig";
import { IntegrationCategory } from "src/core/types";
import { revalidateServerSidePath } from "src/core/utils/revalidate-server-side";

type DeleteMemberModalProps = {
    organizationId: string;
    teamId: string;
    platformName: string;
};

export const ResetIntegrationModal = ({
    organizationId,
    teamId,
    platformName,
}: DeleteMemberModalProps) => {
    const [enabled, setEnabled] = useState(false);
    const { invalidateQueries, generateQueryKey } =
        useReactQueryInvalidateQueries();

    useTimeout(() => {
        setEnabled(true);
    }, 3000);

    const [handleDelete, { loading }] = useAsyncAction(async () => {
        magicModal.lock();

        try {
            await deleteIntegration(organizationId, teamId);

            toast({
                variant: "success",
                title: "Integration deleted successfully",
            });

            await Promise.all([
                invalidateQueries({
                    type: "all",
                    queryKey: generateQueryKey(
                        INTEGRATION_CONFIG.GET_INTEGRATION_CONFIG_BY_CATEGORY,
                        {
                            params: {
                                teamId: teamId,
                                integrationCategory:
                                    IntegrationCategory.CODE_MANAGEMENT,
                            },
                        },
                    ),
                }),

                // Invalidate all queries related to integrations
                invalidateQueries({
                    type: "all",
                    queryKey: ["integrations"],
                }),

                // Invalidate team queries
                invalidateQueries({ type: "all", queryKey: ["teams"] }),
                revalidateServerSidePath("/settings/git"),
            ]);
        } catch (error) {
            toast({
                variant: "warning",
                title: "Error deleting integration",
                description: "Please try again later",
            });
        } finally {
            magicModal.hide();
        }
    });

    return (
        <Dialog open onOpenChange={() => magicModal.hide()}>
            <DialogContent className="w-md">
                <DialogHeader>
                    <DialogTitle>
                        Remove integration with{" "}
                        <strong className="text-danger">{platformName}</strong>?
                    </DialogTitle>
                </DialogHeader>

                <p className="text-sm">
                    You will be able to configure a new Git provider after this
                    operation.
                </p>

                <DialogFooter>
                    <Button
                        size="md"
                        variant="cancel"
                        onClick={() => magicModal.hide()}>
                        Cancel
                    </Button>

                    <Button
                        size="md"
                        variant="tertiary"
                        loading={!enabled || loading}
                        onClick={handleDelete}>
                        Remove integration
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

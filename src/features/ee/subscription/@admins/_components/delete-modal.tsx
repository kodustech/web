"use client";

import { useState } from "react";
import { Button } from "@components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@components/ui/dialog";
import { magicModal } from "@components/ui/magic-modal";
import { toast } from "@components/ui/toaster/use-toast";
import { useTimeout } from "@hooks/use-timeout";
import type { MembersSetup } from "@services/setup/types";
import { useDeleteTeamMember } from "@services/teamMembers/hooks";
import { revalidateServerSidePath } from "src/core/utils/revalidate-server-side";

type DeleteMemberModalProps = {
    member: MembersSetup;
    onSuccess?: () => void;
};

export const DeleteModal = ({ member }: DeleteMemberModalProps) => {
    const [enabled, setEnabled] = useState(false);
    const { mutate: deleteTeamMember, isPending } = useDeleteTeamMember();

    useTimeout(() => {
        setEnabled(true);
    }, 5000);

    const handleDelete = () => {
        if (!member.uuid) return;
        magicModal.lock();

        deleteTeamMember(`${member.uuid}`, {
            onSuccess: (response) => {
                magicModal.hide(true);
                revalidateServerSidePath("/settings/subscription");

                const otherTeams = response?.data;
                if (otherTeams && otherTeams.length > 0) {
                    toast({
                        variant: "success",
                        description: (
                            <div>
                                <p>Member successfully removed!</p>
                                <p className="mt-2">
                                    This member still belongs to the following
                                    teams:{" "}
                                    <strong>{otherTeams.join(", ")}</strong>
                                </p>
                            </div>
                        ),
                    });
                } else {
                    toast({
                        variant: "success",
                        description: "Member successfully removed.",
                    });
                }
            },
            onError: () => {
                toast({
                    description: "Error removing member from the team.",
                    variant: "danger",
                });
                magicModal.hide();
            },
        });
    };

    return (
        <Dialog open onOpenChange={() => magicModal.hide()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Remove this member from the team?</DialogTitle>

                    <DialogDescription>
                        This action cannot be undone!
                    </DialogDescription>
                </DialogHeader>

                <p className="text-sm">
                    Are you sure you want to remove{" "}
                    <strong className="text-destructive">{member.name}</strong>{" "}
                    from the team?
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
                        loading={!enabled || isPending}
                        onClick={handleDelete}>
                        Remove
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

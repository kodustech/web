"use client";

import { useState } from "react";
import { SelectRepositories } from "@components/system/select-repositories";
import { Button } from "@components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@components/ui/dialog";
import { FormControl } from "@components/ui/form-control";
import { magicModal, MagicModalContext } from "@components/ui/magic-modal";
import { useAsyncAction } from "@hooks/use-async-action";
import { useEffectOnce } from "@hooks/use-effect-once";
import { useGetRepositories } from "@services/codeManagement/hooks";
import { Repository } from "@services/codeManagement/types";
import { assignRepos, getAssignedRepos } from "@services/permissions/fetch";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";

export default function AssignReposModal({ userId }: { userId: string }) {
    const { teamId } = useSelectedTeamId();
    const [isLoadingRepositories, setIsLoadingRepositories] = useState(true);

    const [open, setOpen] = useState(false);
    const [selectedRepositories, setSelectedRepositories] = useState<
        Repository[]
    >([]);

    const { data: repositories = [] } = useGetRepositories(teamId);

    useEffectOnce(() => {
        const fetchAssignedRepos = async () => {
            try {
                const assignedRepoIds = await getAssignedRepos(userId);

                const repos = repositories.filter((r) =>
                    assignedRepoIds.includes(r.id),
                );
                setSelectedRepositories(repos);
            } catch (error) {
                console.error("Error fetching assigned repositories:", error);
            } finally {
                setIsLoadingRepositories(false);
            }
        };
        fetchAssignedRepos();
    });

    const [
        saveSelectedRepositoriesAction,
        { loading: loadingSaveRepositories },
    ] = useAsyncAction(async () => {
        const selectedIds = selectedRepositories.map((r) => r.id);

        await assignRepos(selectedIds, userId);

        magicModal.hide();
    });

    const closeable = !loadingSaveRepositories;

    return (
        <MagicModalContext value={{ closeable }}>
            <Dialog open>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Assign repositories</DialogTitle>

                        <DialogDescription>
                            Select the repositories you want to assign to this
                            user
                        </DialogDescription>
                    </DialogHeader>

                    <FormControl.Root className="w-full">
                        <FormControl.Input>
                            <SelectRepositories
                                open={open}
                                teamId={teamId}
                                onOpenChange={setOpen}
                                selectedRepositories={selectedRepositories}
                                onFinishLoading={() =>
                                    setIsLoadingRepositories(false)
                                }
                                onChangeSelectedRepositories={
                                    setSelectedRepositories
                                }
                            />
                        </FormControl.Input>
                    </FormControl.Root>

                    <DialogFooter>
                        {closeable && (
                            <DialogClose>
                                <Button
                                    size="md"
                                    variant="cancel"
                                    onClick={magicModal.hide}>
                                    Cancel
                                </Button>
                            </DialogClose>
                        )}

                        <Button
                            size="md"
                            variant="primary"
                            loading={loadingSaveRepositories}
                            onClick={saveSelectedRepositoriesAction}
                            disabled={
                                selectedRepositories.length === 0 ||
                                isLoadingRepositories
                            }>
                            Edit repositories
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </MagicModalContext>
    );
}

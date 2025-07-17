import { useState } from "react";
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
import { magicModal } from "@components/ui/magic-modal";
import { useAsyncAction } from "@hooks/use-async-action";
import { useReactQueryInvalidateQueries } from "@hooks/use-invalidate-queries";
import { useTimeout } from "@hooks/use-timeout";

import type { CodeReviewRepositoryConfig } from "./pages/types";

export const DeleteRepoConfigModal = ({
    repository,
}: {
    repository: Pick<CodeReviewRepositoryConfig, "id" | "name">;
}) => {
    const [enabled, setEnabled] = useState(false);
    const { invalidateQueries } = useReactQueryInvalidateQueries();

    useTimeout(() => {
        setEnabled(true);
    }, 5000);

    const [handleSubmit, { loading }] = useAsyncAction(async () => {
        try {
            magicModal.lock();
            // TODO: do something using `repository.id`
        } catch {
            // TODO: handle error if needed
        } finally {
            magicModal.hide(true);
        }

        // TODO: invalidate queries if needed
        // await invalidateQueries({
        //     type: "all",
        //     queryKey: generateQueryKey(PARAMETERS_PATHS.GET_BY_KEY, {
        //         params: {
        //             key: ParametersConfigKey.CODE_REVIEW_CONFIG,
        //             teamId,
        //         },
        //     }),
        // });
    });

    return (
        <Dialog open onOpenChange={() => magicModal.hide()}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>
                        Delete{" "}
                        <strong className="text-danger">
                            {repository.name}
                        </strong>{" "}
                        configuration?
                    </DialogTitle>

                    <DialogDescription>
                        This action cannot be undone! After this operation,
                        global configuration will be applied to this repository.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button size="md" variant="cancel">
                            Cancel
                        </Button>
                    </DialogClose>

                    <Button
                        size="md"
                        variant="tertiary"
                        loading={!enabled || loading}
                        onClick={handleSubmit}>
                        Delete configuration
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

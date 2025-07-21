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
import { toast } from "@components/ui/toaster/use-toast";
import { useAsyncAction } from "@hooks/use-async-action";
import { useReactQueryInvalidateQueries } from "@hooks/use-invalidate-queries";
import { useTimeout } from "@hooks/use-timeout";
import { deleteRepositoryCodeReviewParameter, updateCodeReviewParameterRepositories } from "@services/parameters/fetch";
import { PARAMETERS_PATHS } from "@services/parameters";
import { generateQueryKey } from "src/core/utils/reactQuery";
import { ParametersConfigKey } from "@services/parameters/types";

import type { CodeReviewRepositoryConfig } from "./pages/types";

export const DeleteRepoConfigModal = ({
    repository,
    teamId,
}: {
    repository: Pick<CodeReviewRepositoryConfig, "id" | "name">;
    teamId: string;
}) => {
    const [enabled, setEnabled] = useState(false);
    const { invalidateQueries } = useReactQueryInvalidateQueries();

    useTimeout(() => {
        setEnabled(true);
    }, 5000);

    const [handleSubmit, { loading }] = useAsyncAction(async () => {
        if (!teamId) {
            toast({
                title: "Erro",
                description: "ID do time não encontrado. Tente recarregar a página.",
                variant: "danger",
            });
            return;
        }

        try {
            magicModal.lock();

            await deleteRepositoryCodeReviewParameter(teamId, repository.id);
            await updateCodeReviewParameterRepositories(teamId);

            await invalidateQueries({
                type: "all",
                queryKey: generateQueryKey(PARAMETERS_PATHS.GET_BY_KEY, {
                    params: {
                        key: ParametersConfigKey.CODE_REVIEW_CONFIG,
                        teamId,
                    },
                }),
            });
        } catch (error: any) {
            console.error("Erro completo:", error);

            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                "Não foi possível deletar a configuração do repositório. Tente novamente.";

            toast({
                title: "Erro ao deletar configuração",
                description: errorMessage,
                variant: "danger",
            });
        } finally {
            magicModal.hide(true);
        }
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

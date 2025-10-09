import { Suspense, useMemo } from "react";
import { Button } from "@components/ui/button";
import { Card, CardHeader } from "@components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@components/ui/dialog";
import { FormControl } from "@components/ui/form-control";
import { magicModal } from "@components/ui/magic-modal";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@components/ui/select";
import { Spinner } from "@components/ui/spinner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useReactQueryInvalidateQueries } from "@hooks/use-invalidate-queries";
import { PARAMETERS_PATHS } from "@services/parameters";
import {
    copyCodeReviewParameter,
    createOrUpdateCodeReviewParameter,
} from "@services/parameters/fetch";
import { ParametersConfigKey } from "@services/parameters/types";
import { ArrowDownIcon, CopyPlusIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";
import { z } from "zod";

import { GitDirectorySelector } from "../code-review/_components/git-directory-selector";

type Repository = {
    id: string;
    name: string;
    isSelected?: boolean;
};

interface IForm {
    originRepositoryId: string;
    targetRepositoryId: string;
    targetDirectoryPath: string;
}

const formSchema = z.object({
    originRepositoryId: z.string(),
    targetRepositoryId: z.string(),
    targetDirectoryPath: z.string(),
});
export const AddRepoModal = ({
    repositories,
}: {
    repositories: Repository[];
}) => {
    const { teamId } = useSelectedTeamId();

    const availableOriginRepositories = useMemo<Repository[]>(
        () => [{ id: "global", name: "Global" }, ...repositories],
        [repositories],
    );

    const form = useForm<IForm>({
        mode: "all",
        reValidateMode: "onChange",
        criteriaMode: "firstError",
        resolver: zodResolver(formSchema),
        defaultValues: {
            originRepositoryId: "global",
        },
    });

    const repositoryId = form.watch("targetRepositoryId");

    const formState = form.formState;

    const { resetQueries, generateQueryKey } = useReactQueryInvalidateQueries();

    const handleSubmit = form.handleSubmit(async (values) => {
        magicModal.lock();

        await createOrUpdateCodeReviewParameter(
            {},
            teamId,
            values.targetRepositoryId,
            undefined,
            values.targetDirectoryPath,
        );

        await resetQueries({
            queryKey: generateQueryKey(PARAMETERS_PATHS.GET_BY_KEY, {
                params: {
                    key: ParametersConfigKey.CODE_REVIEW_CONFIG,
                    teamId,
                },
            }),
        });

        magicModal.hide(true);
    });

    return (
        <Dialog open onOpenChange={() => magicModal.hide()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Copy repository settings</DialogTitle>
                </DialogHeader>

                <div className="-mx-6 flex flex-col gap-6 overflow-auto px-6 py-1">
                    <Controller
                        name="originRepositoryId"
                        rules={{ required: "Choose a repository" }}
                        control={form.control}
                        render={({ field }) => (
                            <FormControl.Root>
                                <FormControl.Label htmlFor={field.name}>
                                    Select the origin repository
                                </FormControl.Label>

                                <FormControl.Input>
                                    <Select
                                        value={field.value}
                                        onValueChange={(value) => {
                                            field.onChange(value);
                                        }}>
                                        <SelectTrigger
                                            id={field.name}
                                            className="w-full"
                                            aria-label="Select target repository">
                                            <SelectValue placeholder="Select a repo to copy settings" />
                                        </SelectTrigger>

                                        <SelectContent className="max-h-56 w-[var(--radix-popper-anchor-width)] overflow-y-auto">
                                            {availableOriginRepositories.map(
                                                (r) => (
                                                    <SelectItem
                                                        key={r.id}
                                                        value={r.id}>
                                                        {r.name}
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>
                                </FormControl.Input>
                            </FormControl.Root>
                        )}
                    />

                    <div className="text-secondary-light -mb-2 flex justify-center">
                        <ArrowDownIcon />
                        <ArrowDownIcon />
                        <ArrowDownIcon />
                    </div>

                    <Controller
                        name="targetRepositoryId"
                        control={form.control}
                        render={({ field }) => (
                            <FormControl.Root>
                                <FormControl.Label htmlFor={field.name}>
                                    Select the target repository
                                </FormControl.Label>

                                <FormControl.Input>
                                    <Select
                                        value={field.value}
                                        onValueChange={(value) => {
                                            field.onChange(value);

                                            const repository =
                                                repositories.find(
                                                    (r) => r.id === value,
                                                );

                                            if (!repository?.isSelected) {
                                                form.setValue(
                                                    "targetDirectoryPath",
                                                    "/",
                                                );
                                            }
                                        }}>
                                        <SelectTrigger
                                            id={field.name}
                                            className="w-full"
                                            aria-label="Select target repository">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>

                                        <SelectContent className="max-h-56 w-[var(--radix-popper-anchor-width)] overflow-y-auto">
                                            {repositories.length === 0 ? (
                                                <div className="text-text-secondary px-5 py-4 text-sm">
                                                    No repositories to select
                                                </div>
                                            ) : (
                                                <>
                                                    {repositories.map(
                                                        (
                                                            availableRepository,
                                                        ) => (
                                                            <SelectItem
                                                                key={
                                                                    availableRepository.id
                                                                }
                                                                value={
                                                                    availableRepository.id
                                                                }>
                                                                {
                                                                    availableRepository.name
                                                                }
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </FormControl.Input>

                                <FormControl.Helper>
                                    The changes you make in this repository will
                                    override global defaults.
                                </FormControl.Helper>
                            </FormControl.Root>
                        )}
                    />

                    {repositoryId && (
                        <Controller
                            name="targetDirectoryPath"
                            control={form.control}
                            render={({ field }) => (
                                <FormControl.Root>
                                    <FormControl.Label htmlFor={field.name}>
                                        Select the target directory
                                    </FormControl.Label>

                                    <FormControl.Input>
                                        <Card className="ring-1">
                                            <Suspense
                                                fallback={
                                                    <CardHeader className="flex-row items-center gap-5 py-4 text-sm">
                                                        <Spinner className="size-6" />
                                                        <span className="text-text-secondary">
                                                            Loading directories
                                                        </span>
                                                    </CardHeader>
                                                }>
                                                <CardHeader className="h-full overflow-y-auto py-4">
                                                    <GitDirectorySelector
                                                        value={field.value}
                                                        repositoryId={
                                                            repositoryId
                                                        }
                                                        onValueChange={
                                                            field.onChange
                                                        }
                                                    />
                                                </CardHeader>
                                            </Suspense>
                                        </Card>
                                    </FormControl.Input>

                                    {field.value && (
                                        <FormControl.Helper>
                                            Selected directory is
                                            <span className="text-primary-light ml-1">
                                                {field.value}
                                            </span>
                                        </FormControl.Helper>
                                    )}
                                </FormControl.Root>
                            )}
                        />
                    )}
                </div>

                <DialogFooter>
                    <Button
                        size="md"
                        variant="primary"
                        onClick={handleSubmit}
                        leftIcon={<CopyPlusIcon />}
                        disabled={!formState.isValid}
                        loading={formState.isSubmitting}>
                        Copy settings
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

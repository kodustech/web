import { useEffect, useState } from "react";
import { Button } from "@components/ui/button";
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
import { useReactQueryInvalidateQueries } from "@hooks/use-invalidate-queries";
import { Separator } from "@radix-ui/react-separator";
import { PARAMETERS_PATHS } from "@services/parameters";
import { copyCodeReviewParameter } from "@services/parameters/fetch";
import { ParametersConfigKey } from "@services/parameters/types";
import { Controller, useForm } from "react-hook-form";

import { CodeReviewGlobalConfig } from "../../types";

type Repository = CodeReviewGlobalConfig & {
    id: string;
    name: string;
    isSelected?: boolean;
};

interface IForm {
    repoSettingsToCopy: string;
    repoTarget: string;
}

export const AddRepoModal = ({
    codeReviewGlobalConfig,
    repositories,
    teamId,
}: {
    codeReviewGlobalConfig: CodeReviewGlobalConfig;
    repositories: Repository[];
    teamId: string;
}) => {
    const [availableRepositoriesToCopy, setAvailableRepositoriesToCopy] =
        useState<Repository[]>();
    const [selectedRepositoryToCopy, setSelectedRepositoryToCopy] =
        useState("");

    const availableRepositories = repositories.filter(
        (repo) => !repo?.isSelected,
    );
    const [selectedRepository, setSelectedRepository] = useState("");

    const form = useForm<IForm>({
        mode: "all",
        reValidateMode: "onChange",
        criteriaMode: "firstError",
        defaultValues: {
            repoSettingsToCopy: "global",
        },
    });

    const formState = form.formState;

    useEffect(() => {
        const newAvailableRepositoriesToCopy = getAvailableReposToCopyFromArray(
            codeReviewGlobalConfig,
            repositories,
        );
        setAvailableRepositoriesToCopy(newAvailableRepositoriesToCopy);

        if (newAvailableRepositoriesToCopy.length > 0) {
            setSelectedRepositoryToCopy(newAvailableRepositoriesToCopy[0].id);
        } else {
            setSelectedRepositoryToCopy("");
        }
    }, [codeReviewGlobalConfig, repositories]);

    const { invalidateQueries, generateQueryKey } =
        useReactQueryInvalidateQueries();

    const handleSubmit = form.handleSubmit(async () => {
        magicModal.lock();

        await copyCodeReviewParameter(
            teamId,
            selectedRepositoryToCopy,
            selectedRepository,
        );

        await invalidateQueries({
            type: "all",
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
                    <DialogTitle>Add a repository to configure</DialogTitle>
                    <Separator />
                </DialogHeader>

                <div className="-mx-6 flex flex-col gap-8 overflow-y-auto px-6">
                    <Controller
                        name="repoSettingsToCopy"
                        rules={{ required: "Choose a repository" }}
                        control={form.control}
                        render={({ field }) => (
                            <FormControl.Root>
                                <FormControl.Label
                                    className="mb-0 flex flex-row gap-1"
                                    htmlFor={field.name}>
                                    Select a repository to copy settings
                                </FormControl.Label>

                                <FormControl.Input>
                                    <Select
                                        value={selectedRepositoryToCopy}
                                        onValueChange={(value) => {
                                            setSelectedRepositoryToCopy(value);
                                            field.onChange(value);
                                        }}>
                                        <SelectTrigger id="repositoryTarget">
                                            <SelectValue placeholder="Select a repo to copy settings" />
                                        </SelectTrigger>

                                        <SelectContent>
                                            {availableRepositoriesToCopy?.map(
                                                (availableRepository) => (
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
                                        </SelectContent>
                                    </Select>
                                </FormControl.Input>
                            </FormControl.Root>
                        )}
                    />

                    <Controller
                        name="repoTarget"
                        control={form.control}
                        render={({ field }) => (
                            <FormControl.Root>
                                <FormControl.Label
                                    className="mb-0 flex flex-row gap-1"
                                    htmlFor={field.name}>
                                    Select the target repository
                                </FormControl.Label>

                                <FormControl.Input>
                                    <Select
                                        value={selectedRepository}
                                        onValueChange={(value) => {
                                            setSelectedRepository(value);
                                            field.onChange(value);
                                        }}>
                                        <SelectTrigger id="repoTarget">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>

                                        <SelectContent>
                                            {availableRepositories.map(
                                                (availableRepository) => (
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
                </div>
                <DialogFooter>
                    <Button
                        formTarget="add-or-update-rule-form"
                        loading={formState.isSubmitting}
                        onClick={handleSubmit}
                        disabled={
                            !formState.isValid ||
                            !formState.isDirty ||
                            !selectedRepositoryToCopy ||
                            !selectedRepository
                        } // Ensure both selects have values
                    >
                        Confirm
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const getAvailableReposToCopyFromArray = (
    codeReviewGlobalConfig: CodeReviewGlobalConfig,
    repositories: Repository[],
) => {
    const globalConfig = {
        id: "global",
        name: "Global",
        ...codeReviewGlobalConfig,
    };

    const availableRepos = repositories.filter((repo) => repo.isSelected);

    const reposWithCodeReviewProperties =
        getReposWithCodeReviewProperties(availableRepos);

    const reposToCopyFrom = [globalConfig, ...reposWithCodeReviewProperties];

    return reposToCopyFrom;
};

const getReposWithCodeReviewProperties = (repositories: Repository[]) => {
    return repositories.filter((repo) => {
        const { id, name, ...rest } = repo;
        return Object.keys(rest).length > 0;
    });
};

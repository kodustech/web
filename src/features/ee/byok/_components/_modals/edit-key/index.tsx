import { Suspense } from "react";
import { Alert } from "@components/ui/alert";
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
import { Skeleton } from "@components/ui/skeleton";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAsyncAction } from "@hooks/use-async-action";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { SaveIcon, TrashIcon } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";
import { FormProvider, useForm } from "react-hook-form";

import type { BYOKConfig } from "../../../_types";
import { ByokBaseURLInput } from "./_components/baseurl-input";
import { ByokKeyInput } from "./_components/key-input";
import { ByokModelSelect, ByokManualModelInput } from "./_components/models";
import { ByokProviderSelect } from "./_components/provider";
import { editKeySchema, type EditKeyForm } from "./_types";

export const BYOKEditKeyModal = ({
    type,
    config,
    onSave,
    onDelete,
}: {
    type: "main" | "fallback";
    config?: BYOKConfig;
    onSave: (_: BYOKConfig) => Promise<void>;
    onDelete: () => Promise<void>;
}) => {
    const form = useForm<EditKeyForm>({
        mode: "onChange",
        resolver: zodResolver(editKeySchema),
        defaultValues: {
            provider: config?.provider,
            model: config?.model,
            baseURL: config?.baseURL,
        },
    });

    const { isValid, isSubmitting } = form.formState;

    const provider = form.watch("provider");
    const model = form.watch("model");

    const handleSubmit = form.handleSubmit(async (config) => {
        await onSave({
            ...config,
            baseURL: config.baseURL || undefined,
        });
        magicModal.hide();
    });

    const [deleteKey, { loading: isDeletingKey }] = useAsyncAction(async () => {
        await onDelete();
        magicModal.hide();
    });

    return (
        <FormProvider {...form}>
            <QueryErrorResetBoundary>
                {({ reset }) => (
                    <Dialog open onOpenChange={() => magicModal.hide()}>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>
                                    {!config ? "Add" : "Edit"} {type} key
                                </DialogTitle>
                            </DialogHeader>

                            <div className="-mx-6 mt-4 flex flex-col gap-6 overflow-y-auto px-6 pb-1">
                                <ErrorBoundary
                                    onReset={reset}
                                    fallbackRender={({
                                        resetErrorBoundary,
                                    }) => (
                                        <Alert
                                            variant="danger"
                                            className="flex items-start justify-between gap-6">
                                            <span className="text-sm">
                                                There was an error when loading
                                                providers. Please, try again
                                                later.
                                            </span>
                                            <Button
                                                variant="tertiary"
                                                size="xs"
                                                onClick={() =>
                                                    resetErrorBoundary()
                                                }>
                                                Try again
                                            </Button>
                                        </Alert>
                                    )}>
                                    <Suspense
                                        fallback={
                                            <FormControl.Root>
                                                <FormControl.Label>
                                                    Provider
                                                </FormControl.Label>

                                                <FormControl.Input>
                                                    <Skeleton className="h-10" />
                                                </FormControl.Input>
                                            </FormControl.Root>
                                        }>
                                        <ByokProviderSelect />
                                    </Suspense>
                                </ErrorBoundary>

                                {provider && <ByokBaseURLInput />}

                                {provider && (
                                    <ErrorBoundary
                                        onReset={reset}
                                        resetKeys={[provider]}
                                        fallbackRender={({
                                            resetErrorBoundary,
                                        }) => (
                                            <div className="flex flex-col gap-4">
                                                <Alert
                                                    variant="danger"
                                                    className="flex items-start justify-between gap-6">
                                                    <span className="text-sm">
                                                        There was an error when
                                                        loading models. You can
                                                        still type a model
                                                        manually below, or try
                                                        again later / switch
                                                        provider.
                                                    </span>
                                                    <Button
                                                        variant="tertiary"
                                                        size="xs"
                                                        onClick={() =>
                                                            resetErrorBoundary()
                                                        }>
                                                        Try again
                                                    </Button>
                                                </Alert>

                                                <ByokManualModelInput />
                                            </div>
                                        )}>
                                        <Suspense
                                            fallback={
                                                <FormControl.Root>
                                                    <FormControl.Label>
                                                        Model
                                                    </FormControl.Label>

                                                    <FormControl.Input>
                                                        <Skeleton className="h-10" />
                                                    </FormControl.Input>
                                                </FormControl.Root>
                                            }>
                                            <ByokModelSelect />
                                        </Suspense>
                                    </ErrorBoundary>
                                )}

                                {model?.trim().length > 0 && <ByokKeyInput />}
                            </div>

                            <DialogFooter className="justify-between">
                                <div>
                                    {config && (
                                        <Button
                                            size="sm"
                                            variant="cancel"
                                            leftIcon={<TrashIcon />}
                                            loading={isDeletingKey}
                                            className="text-danger px-0 [--button-foreground:var(--color-danger)]"
                                            onClick={() => deleteKey()}>
                                            Delete
                                        </Button>
                                    )}
                                </div>

                                <Button
                                    size="md"
                                    variant="primary"
                                    leftIcon={<SaveIcon />}
                                    disabled={!isValid}
                                    loading={isSubmitting}
                                    onClick={() => handleSubmit()}>
                                    Save key
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </QueryErrorResetBoundary>
        </FormProvider>
    );
};

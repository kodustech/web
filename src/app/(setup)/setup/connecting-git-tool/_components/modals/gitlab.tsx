"use client";

import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@components/ui/alert";
import { Button } from "@components/ui/button";
import { Card, CardHeader } from "@components/ui/card";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@components/ui/collapsible";
import { FormControl } from "@components/ui/form-control";
import { Input } from "@components/ui/input";
import { magicModal } from "@components/ui/magic-modal";
import { Switch } from "@components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCodeManagementIntegration } from "@services/codeManagement/fetch";
import { AxiosError } from "axios";
import { Info, SaveIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { GitTokenDocs } from "src/core/components/system/git-token-docs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "src/core/components/ui/dialog";
import { AuthMode, PlatformType } from "src/core/types";
import { captureSegmentEvent } from "src/core/utils/segment";
import { z } from "zod";

const tokenFormSchema = z.object({
    token: z.string().min(1, { message: "Enter a Token" }),
    selfhostUrl: z.string().optional(),
});

export const GitlabTokenModal = (props: { teamId: string; userId: string }) => {
    const [selfhosted, setSelfhosted] = useState(false);

    const form = useForm({
        resolver: zodResolver(tokenFormSchema),
        mode: "all",
        defaultValues: {
            token: "",
            selfhostUrl: undefined,
        },
    });

    const submit = async (data: z.infer<typeof tokenFormSchema>) => {
        magicModal.lock();

        try {
            await createCodeManagementIntegration({
                integrationType: PlatformType.GITLAB,
                authMode: AuthMode.TOKEN,
                token: data.token,
                host: data.selfhostUrl,
                organizationAndTeamData: {
                    teamId: props.teamId,
                },
            });

            await captureSegmentEvent({
                userId: props?.userId!,
                event: "setup_git_integration_success",
                properties: {
                    platform: "github",
                    method: "token",
                    teamId: props?.teamId,
                },
            });

            magicModal.hide(true);
        } catch (error) {
            magicModal.unlock();

            if (error instanceof AxiosError && error.status === 400) {
                form.setError("token", {
                    type: "custom",
                    message: "Invalid Token",
                });
            }
        }
    };

    const {
        isDirty: formIsDirty,
        isValid: formIsValid,
        isSubmitting: formIsSubmitting,
    } = form.formState;

    return (
        <Dialog open onOpenChange={() => magicModal.hide()}>
            <DialogContent>
                <form onSubmit={form.handleSubmit(submit)}>
                    <DialogHeader>
                        <DialogTitle>Gitlab Personal Access Token</DialogTitle>
                        <DialogDescription></DialogDescription>
                    </DialogHeader>

                    <Alert variant="info" className="my-4">
                        <Info />
                        <AlertTitle>Heads up!</AlertTitle>
                        <AlertDescription>
                            Unlike OAuth, reviews will be published using your
                            profile - not Kody's.
                        </AlertDescription>
                    </Alert>

                    <div className="flex flex-col gap-4">
                        <Controller
                            name="token"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <FormControl.Root>
                                    <FormControl.Input>
                                        <Input
                                            {...field}
                                            type="password"
                                            error={fieldState.error}
                                            placeholder="Paste your Token here"
                                        />
                                    </FormControl.Input>

                                    <FormControl.Error>
                                        {fieldState.error?.message}
                                    </FormControl.Error>
                                </FormControl.Root>
                            )}
                        />

                        <Collapsible
                            open={selfhosted}
                            onOpenChange={(s) => setSelfhosted(s)}
                            className="flex flex-col gap-1">
                            <div className="relative">
                                <CollapsibleTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="helper"
                                        size="lg"
                                        className="w-full items-center justify-between py-4">
                                        <FormControl.Label className="mb-0">
                                            Self-hosted
                                        </FormControl.Label>
                                    </Button>
                                </CollapsibleTrigger>

                                <div className="pointer-events-none absolute inset-y-0 right-6 flex items-center">
                                    <Switch decorative checked={selfhosted} />
                                </div>
                            </div>

                            <CollapsibleContent>
                                <Card color="lv1">
                                    <CardHeader>
                                        <Controller
                                            name="selfhostUrl"
                                            control={form.control}
                                            render={({ field, fieldState }) => (
                                                <FormControl.Root>
                                                    <FormControl.Label
                                                        htmlFor={field.name}>
                                                        Gitlab URL
                                                    </FormControl.Label>

                                                    <FormControl.Input>
                                                        <Input
                                                            {...field}
                                                            autoFocus
                                                            id={field.name}
                                                            error={
                                                                fieldState.error
                                                            }
                                                            placeholder="Enter the URL of your authentication server"
                                                        />
                                                    </FormControl.Input>

                                                    <FormControl.Error>
                                                        {
                                                            fieldState.error
                                                                ?.message
                                                        }
                                                    </FormControl.Error>
                                                </FormControl.Root>
                                            )}
                                        />
                                    </CardHeader>
                                </Card>
                            </CollapsibleContent>
                        </Collapsible>

                        <GitTokenDocs provider="gitlab" />
                    </div>

                    <DialogFooter>
                        <Button
                            size="md"
                            type="button"
                            variant="cancel"
                            onClick={() => magicModal.hide()}>
                            Cancel
                        </Button>

                        <Button
                            size="md"
                            type="submit"
                            variant="primary"
                            leftIcon={<SaveIcon />}
                            loading={formIsSubmitting}
                            disabled={!formIsValid}>
                            Validate and save
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

"use client";

import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@components/ui/alert";
import { Button } from "@components/ui/button";
import { Collapsible, CollapsibleContent } from "@components/ui/collapsible";
import { FormControl } from "@components/ui/form-control";
import { Input } from "@components/ui/input";
import { magicModal } from "@components/ui/magic-modal";
import { Switch } from "@components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCodeManagementIntegration } from "@services/codeManagement/fetch";
import { AxiosError } from "axios";
import { Info } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "src/core/components/ui/dialog";
import { AuthMode, PlatformType } from "src/core/types";
import { z } from "zod";

import { TokenDocs } from "../token-docs";
import { captureSegmentEvent } from "src/core/utils/segment";

const tokenFormSchema = z.object({
    token: z.string().min(1, { message: "Enter a Token" }),
    selfhostUrl: z.string().optional(),
});

export const GitlabTokenModal = (props: { teamId: string, userId: string }) => {
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
                    teamId: props?.teamId
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

                    <Alert className="my-4 border-ring/50 text-ring dark:border-ring [&>svg]:text-ring">
                        <Info size={18} />
                        <AlertTitle>Heads up!</AlertTitle>
                        <AlertDescription>
                            Unlike OAuth, reviews will be published using your
                            profile - not Kody's.
                        </AlertDescription>
                    </Alert>

                    <div className="flex flex-col gap-6">
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
                            className="flex flex-col gap-4">
                            <FormControl.Root className="flex-row items-center justify-between">
                                <FormControl.Label htmlFor="self-hosted">
                                    Self-hosted
                                </FormControl.Label>

                                <FormControl.Input>
                                    <Switch
                                        id="self-hosted"
                                        checked={selfhosted}
                                        onCheckedChange={setSelfhosted}
                                    />
                                </FormControl.Input>
                            </FormControl.Root>

                            <CollapsibleContent>
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
                                                    error={fieldState.error}
                                                    placeholder="Enter the URL of your authentication server"
                                                />
                                            </FormControl.Input>

                                            <FormControl.Error>
                                                {fieldState.error?.message}
                                            </FormControl.Error>
                                        </FormControl.Root>
                                    )}
                                />
                            </CollapsibleContent>
                        </Collapsible>

                        <TokenDocs link="https://docs.kodus.io/config/gitlab_pat" />
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => magicModal.hide()}>
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            loading={formIsSubmitting}
                            disabled={!formIsValid}>
                            Next
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

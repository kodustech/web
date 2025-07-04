"use client";

import { useRouter } from "next/navigation";
import { Button } from "@components/ui/button";
import { FormControl } from "@components/ui/form-control";
import { Input } from "@components/ui/input";
import { magicModal } from "@components/ui/magic-modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCodeManagementIntegration } from "@services/codeManagement/fetch";
import { AxiosError } from "axios";
import { SaveIcon } from "lucide-react";
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
    orgName: z.string().min(1, { message: "Enter a Organization Name" }),
});

export const AzureReposTokenModal = (props: {
    teamId: string;
    userId: string;
}) => {
    const router = useRouter();

    const form = useForm({
        resolver: zodResolver(tokenFormSchema),
        mode: "all",
        defaultValues: {
            token: "",
            orgName: "",
        },
    });

    const submit = async (data: z.infer<typeof tokenFormSchema>) => {
        magicModal.lock();

        try {
            const integrationResponse = await createCodeManagementIntegration({
                integrationType: PlatformType.AZURE_REPOS,
                authMode: AuthMode.TOKEN,
                token: data.token,
                organizationAndTeamData: {
                    teamId: props.teamId,
                },
                orgName: data.orgName,
            });

            await captureSegmentEvent({
                userId: props?.userId!,
                event: "setup_git_integration_success",
                properties: {
                    platform: "azure_repos",
                    method: "token",
                    teamId: props?.teamId,
                },
            });

            switch (integrationResponse.data.status) {
                case "SUCCESS": {
                    router.push("/setup/choosing-repositories");
                    break;
                }

                case "NO_ORGANIZATION": {
                    router.replace("/setup/organization-account-required");
                    break;
                }
                case "NO_REPOSITORIES": {
                    router.replace("/setup/no-repositories");
                    break;
                }
            }

            magicModal.hide();
        } catch (error) {
            magicModal.unlock();

            if (error instanceof AxiosError && error.status === 400) {
                form.setError("token", {
                    type: "custom",
                    message: "Invalid Token or Username",
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
                        <DialogTitle>Azure Repos Token</DialogTitle>
                        <DialogDescription></DialogDescription>
                    </DialogHeader>

                    <div className="mt-4 flex flex-col gap-4">
                        <Controller
                            name="orgName"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <FormControl.Root>
                                    <FormControl.Input>
                                        <Input
                                            {...field}
                                            type="text"
                                            error={fieldState.error}
                                            placeholder="Paste your Azure Repos organization name here"
                                        />
                                    </FormControl.Input>

                                    <FormControl.Error>
                                        {fieldState.error?.message}
                                    </FormControl.Error>
                                </FormControl.Root>
                            )}
                        />

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
                                            placeholder="Paste your Azure Repos Personal Access Token here"
                                        />
                                    </FormControl.Input>

                                    <FormControl.Error>
                                        {fieldState.error?.message}
                                    </FormControl.Error>
                                </FormControl.Root>
                            )}
                        />

                        <GitTokenDocs provider="azure_repos" />
                    </div>

                    <DialogFooter>
                        <Button
                            size="md"
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

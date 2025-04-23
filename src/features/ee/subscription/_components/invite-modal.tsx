"use client";

import { useState } from "react";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@components/ui/dialog";
import { FormControl } from "@components/ui/form-control";
import { Input } from "@components/ui/input";
import { magicModal } from "@components/ui/magic-modal";
import { toast } from "@components/ui/toaster/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateOrUpdateTeamMembers } from "@services/setup/hooks";
import { Plus, X } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const emailSchema = z.object({
    email: z
        .string()
        .min(1, { message: "Email is required" })
        .email({ message: "Please enter a valid email" }),
});

type EmailFormValues = z.infer<typeof emailSchema>;

export const InviteModal = ({
    teamId,
}: {
    teamId: string;
    onSuccess?: () => void;
}) => {
    const [emailList, setEmailList] = useState<string[]>([]);

    const createOrUpdateMutation = useCreateOrUpdateTeamMembers();

    const form = useForm<EmailFormValues>({
        resolver: zodResolver(emailSchema),
        mode: "all",
        defaultValues: { email: "" },
    });

    const addEmailToInviteList = (email: string) => {
        if (!emailList.includes(email)) {
            setEmailList((prev) => [...prev, email]);
        } else {
            form.setError("email", { message: "Email already added" });
        }
    };

    const removeEmailFromInviteList = (email: string) => {
        setEmailList((prev) => prev.filter((e) => e !== email));
    };

    const onSubmit = (data: EmailFormValues) => {
        addEmailToInviteList(data.email.trim());
        form.reset(); // Limpa o campo após adicionar o e-mail
    };

    const handleSendEmails = async () => {
        if (!emailList.length) {
            form.setError("email", {
                message: "Add at least one email before submitting",
            });
            return;
        }

        form.clearErrors();
        form.reset();

        createOrUpdateMutation.mutate(
            {
                members: emailList.map((email) => ({ email })),
                teamId,
            },
            {
                onSuccess: () => {
                    toast({
                        variant: "success",
                        description: "The emails were sent!",
                    });
                    setEmailList([]);
                },
                onError: (error) => {
                    toast({
                        variant: "danger",
                        description: "Error sending the emails",
                    });
                },
            },
        );
    };

    return (
        <Dialog open onOpenChange={() => magicModal.hide()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Admin invitation</DialogTitle>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)}>
                    {/* Campo para adicionar e-mails */}
                    <Controller
                        name="email"
                        control={form.control}
                        rules={{
                            validate: (value) => {
                                return emailList.includes(value)
                                    ? "Email already added"
                                    : true;
                            },
                        }}
                        render={({ field, fieldState }) => (
                            <FormControl.Root>
                                <FormControl.Label>Email</FormControl.Label>
                                <FormControl.Input>
                                    <Input
                                        {...field}
                                        placeholder="Type an email to invite"
                                        error={fieldState.error}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();

                                                if (!fieldState.invalid) {
                                                    form.handleSubmit(
                                                        onSubmit,
                                                    )();
                                                }
                                            }
                                        }}
                                        rightIcon={
                                            <Badge
                                                className="-mr-2"
                                                variant="primary-dark"
                                                leftIcon={<Plus />}
                                                disabled={
                                                    !field.value.length ||
                                                    fieldState.invalid ||
                                                    emailList.includes(
                                                        field.value,
                                                    )
                                                }
                                                onClick={() =>
                                                    form.handleSubmit(
                                                        onSubmit,
                                                    )()
                                                }>
                                                Add to invite list
                                            </Badge>
                                        }
                                    />
                                </FormControl.Input>

                                <FormControl.Error>
                                    {fieldState.error?.message}
                                </FormControl.Error>

                                <FormControl.Helper>
                                    After typing an email, press [ENTER] or
                                    click 'Add to invite list'
                                </FormControl.Helper>
                            </FormControl.Root>
                        )}
                    />

                    {/* Lista de e-mails adicionados */}
                    {emailList.length > 0 && (
                        <div className="mt-6">
                            <h3 className="mb-1 text-sm font-medium text-gray-300">
                                Emails added:
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {emailList.map((email) => (
                                    <Badge
                                        key={email}
                                        variant="helper"
                                        className="gap-1"
                                        rightIcon={
                                            <Button
                                                size="icon-xs"
                                                variant="cancel"
                                                className="-mr-1.5"
                                                onClick={() =>
                                                    removeEmailFromInviteList(
                                                        email,
                                                    )
                                                }>
                                                <X className="text-danger" />
                                            </Button>
                                        }>
                                        {email}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-6 flex justify-end">
                        <Button
                            size="md"
                            variant="primary"
                            type="button"
                            onClick={handleSendEmails}
                            loading={createOrUpdateMutation.isPending}
                            disabled={
                                createOrUpdateMutation.isPending ||
                                !emailList.length
                            }>
                            Send invites
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

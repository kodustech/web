"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader } from "@components/ui/card";
import { FormControl } from "@components/ui/form-control";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangleIcon, Eye, EyeClosed, LogInIcon } from "lucide-react";
import { signIn } from "next-auth/react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "src/core/components/ui/button";
import { Input } from "src/core/components/ui/input";
import { z } from "zod";

const signInFormSchema = z.object({
    email: z.string().email({ message: "Please use a valid email address" }),
    password: z.string().min(1, { message: "Enter a password" }),
});

type SignInFormSchema = z.infer<typeof signInFormSchema>;

export function UserAuthForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl");
    const [typePassword, setTypePassword] = useState<"password" | "text">(
        "password",
    );

    const isError = searchParams?.has("error") ?? false;

    useEffect(() => {
        if (callbackUrl?.includes("setup_action=install")) {
            const urlParams = new URL(callbackUrl);

            const installationId =
                urlParams.searchParams.get("installation_id");

            router.push(
                `/github-integration?installation_id=${installationId}`,
            );
        }
    }, [callbackUrl]);

    const form = useForm<SignInFormSchema>({
        mode: "all",
        resolver: zodResolver(signInFormSchema),
        defaultValues: { email: "", password: "" },
    });

    const onSubmit = form.handleSubmit(async (data) => {
        const { email, password } = data;

        await signIn("credentials", {
            email,
            password,
            redirect: true,
            redirectTo: callbackUrl ?? "/setup",
        });
    });

    const {
        isLoading: formIsLoading,
        isValidating: formIsValidating,
        isValid: formIsValid,
        isSubmitting: formIsSubmitting,
    } = form.formState;

    return (
        <form onSubmit={onSubmit} className="grid w-full gap-6">
            {isError && (
                <Card className="bg-warning/10 text-sm">
                    <CardHeader className="flex-row items-center gap-4">
                        <AlertTriangleIcon className="text-warning size-5" />
                        <span>No user found with this email and password.</span>
                    </CardHeader>
                </Card>
            )}

            <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState, formState }) => (
                    <FormControl.Root>
                        <FormControl.Label htmlFor={field.name}>
                            Email
                        </FormControl.Label>

                        <FormControl.Input>
                            <Input
                                {...field}
                                id={field.name}
                                type="email"
                                placeholder="Your corporate email address"
                                error={fieldState.error}
                                autoCapitalize="none"
                                autoCorrect="off"
                                disabled={
                                    formState.isSubmitting ||
                                    formState.isLoading ||
                                    field.disabled
                                }
                            />
                        </FormControl.Input>

                        <FormControl.Error>
                            {fieldState.error?.message}
                        </FormControl.Error>
                    </FormControl.Root>
                )}
            />

            <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState, formState }) => (
                    <FormControl.Root>
                        <FormControl.Label htmlFor={field.name}>
                            Password
                        </FormControl.Label>

                        <FormControl.Input>
                            <Input
                                {...field}
                                id={field.name}
                                type={typePassword}
                                placeholder="Type your password"
                                error={fieldState.error}
                                autoCapitalize="none"
                                autoCorrect="off"
                                autoComplete="off"
                                disabled={
                                    formState.isSubmitting ||
                                    formState.isLoading ||
                                    field.disabled
                                }
                                rightIcon={
                                    <Button
                                        variant="helper"
                                        size="icon-sm"
                                        type="button"
                                        className="-mr-2"
                                        onClick={() =>
                                            setTypePassword((typePassword) =>
                                                typePassword === "password"
                                                    ? "text"
                                                    : "password",
                                            )
                                        }>
                                        {typePassword === "password" ? (
                                            <EyeClosed />
                                        ) : (
                                            <Eye />
                                        )}
                                    </Button>
                                }
                            />
                        </FormControl.Input>

                        <FormControl.Error>
                            {fieldState.error?.message}
                        </FormControl.Error>
                    </FormControl.Root>
                )}
            />

            <Button
                size="lg"
                type="submit"
                variant="primary"
                className="w-full"
                disabled={!formIsValid}
                rightIcon={<LogInIcon />}
                loading={formIsLoading || formIsSubmitting || formIsValidating}>
                Sign in
            </Button>
        </form>
    );
}

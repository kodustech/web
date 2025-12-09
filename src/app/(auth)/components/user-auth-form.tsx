"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader } from "@components/ui/card";
import { FormControl } from "@components/ui/form-control";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    AlertTriangleIcon,
    ArrowRight,
    Eye,
    EyeClosed,
    LogInIcon,
} from "lucide-react";
import { signIn } from "next-auth/react";
import { Controller, Resolver, useForm } from "react-hook-form";
import { Button } from "src/core/components/ui/button";
import { Input } from "src/core/components/ui/input";
import { ssoCheck, ssoLogin } from "src/lib/auth/fetchers";
import { z } from "zod";

const emailSchema = z.object({
    email: z.email({ message: "Please use a valid email address" }),
});

const signInFormSchema = emailSchema.extend({
    password: z.string().min(1, { error: "Enter a password" }),
});

type SignInFormSchema = z.infer<typeof signInFormSchema>;

type AuthStep = "email" | "sso-choice" | "password";

export function UserAuthForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl");
    const reason = searchParams.get("reason");

    const [step, setStep] = useState<AuthStep>("email");
    const [typePassword, setTypePassword] = useState<"password" | "text">(
        "password",
    );
    const [isCheckingSSO, setIsCheckingSSO] = useState(false);
    const [ssoAvailable, setSsoAvailable] = useState<{
        active: boolean;
        organizationId: string;
    } | null>(null);

    const isError = searchParams?.has("error") ?? false;
    
    const getReasonMessage = () => {
        switch (reason) {
            case "removed":
                return "Your account has been removed from the organization.";
            case "inactive":
                return "Your account is inactive. Please contact your administrator.";
            default:
                return null;
        }
    };
    
    const reasonMessage = getReasonMessage();

    useEffect(() => {
        if (callbackUrl?.includes("setup_action=install")) {
            const urlParams = new URL(callbackUrl);
            const installationId =
                urlParams.searchParams.get("installation_id");
            router.push(
                `/github-integration?installation_id=${installationId}`,
            );
        }
    }, [callbackUrl, router]);

    const form = useForm<SignInFormSchema>({
        mode: "onChange",
        resolver: zodResolver(
            step === "password" ? signInFormSchema : emailSchema,
        ) as unknown as Resolver<SignInFormSchema>,
        defaultValues: { email: "", password: "" },
    });

    const emailValue = form.watch("email");

    // Reset state if user modifies email after proceeding
    // We only want to reset if we are NOT in the initial step and the email changes
    useEffect(() => {
        if (step !== "email") {
            // Optional: You can choose to automatically reset to step 'email'
            // if the user starts typing in the email field again.
            // For now, we will lock the email input in later steps to prevent confusion.
        }
    }, [emailValue, step]);

    const checkSsoAvailability = async (email: string) => {
        try {
            const domain = email.split("@")[1];
            // Replace with your actual API call
            const response = await ssoCheck(domain);
            setSsoAvailable(response);
            return response;
        } catch (error) {
            console.error(error);
            setSsoAvailable(null);
            return null;
        }
    };

    // Step 1: Handle "Continue" click (Check Email -> Check SSO)
    const handleEmailStep = async (data: { email: string }) => {
        setIsCheckingSSO(true);
        const ssoResponse = await checkSsoAvailability(data.email);
        setIsCheckingSSO(false);

        if (ssoResponse?.active && ssoResponse.organizationId) {
            // Logic Requirement: If SSO available -> Go to Choice Screen
            setStep("sso-choice");
        } else {
            // Logic Requirement: If No SSO -> Go straight to Password
            setStep("password");
        }
    };

    // Step 2 (Choice): User clicks "Continue with SSO"
    const handleSsoLogin = async () => {
        if (ssoAvailable?.organizationId) {
            await ssoLogin(ssoAvailable.organizationId);
        }
    };

    // Step 3 (Password): User submits email + password
    const handlePasswordLogin = async (data: SignInFormSchema) => {
        const { email, password } = data;
        await signIn("credentials", {
            email,
            password,
            redirect: true,
            redirectTo: callbackUrl ?? "/setup",
        });
    };

    // Main Submit Handler
    const handleSubmit = async (data: SignInFormSchema) => {
        if (step === "email") {
            await handleEmailStep(data);
        } else if (step === "password") {
            await handlePasswordLogin(data);
        }
        // Note: "sso-choice" step buttons handle their own clicks,
        // they don't trigger the form submit event usually.
    };

    const resetFlow = () => {
        setStep("email");
        setSsoAvailable(null);
        form.setValue("password", "");
        form.clearErrors();
    };

    const {
        isLoading: formIsLoading,
        isValidating: formIsValidating,
        isValid: formIsValid,
        isSubmitting: formIsSubmitting,
    } = form.formState;

    const isLoading =
        formIsLoading || formIsSubmitting || formIsValidating || isCheckingSSO;

    return (
        <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="grid w-full gap-6">
            {reasonMessage && (
                <Card className="bg-danger/10 text-sm">
                    <CardHeader className="flex-row items-center gap-4">
                        <AlertTriangleIcon className="text-danger size-5" />
                        <span>{reasonMessage}</span>
                    </CardHeader>
                </Card>
            )}
            
            {isError && !reasonMessage && (
                <Card className="bg-warning/10 text-sm">
                    <CardHeader className="flex-row items-center gap-4">
                        <AlertTriangleIcon className="text-warning size-5" />
                        <span>No user found with this email and password.</span>
                    </CardHeader>
                </Card>
            )}

            {/* Email Field - Always Visible, but readOnly if not in step 1 */}
            <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
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
                                disabled={isLoading || step !== "email"}
                                rightIcon={
                                    step !== "email" ? (
                                        <Button
                                            variant="helper"
                                            size="xs"
                                            type="button"
                                            onClick={resetFlow}
                                            className="text-muted-foreground hover:text-primary text-xs">
                                            Change
                                        </Button>
                                    ) : undefined
                                }
                            />
                        </FormControl.Input>
                        <FormControl.Error>
                            {fieldState.error?.message}
                        </FormControl.Error>
                    </FormControl.Root>
                )}
            />

            {/* Step 2: SSO Choice Screen */}
            {step === "sso-choice" && (
                <div className="animate-in fade-in slide-in-from-top-2 space-y-4">
                    <div className="bg-muted text-muted-foreground rounded-md p-4 text-sm">
                        Single Sign-On is available for{" "}
                        <strong>{emailValue.split("@")[1]}</strong>.
                    </div>

                    <Button
                        type="button"
                        variant="secondary"
                        size="lg"
                        className="w-full"
                        onClick={handleSsoLogin}
                        disabled={isLoading}
                        rightIcon={<ArrowRight />}
                        loading={isLoading}>
                        Continue with SSO
                    </Button>

                    <div className="relative my-2">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background text-muted-foreground px-2">
                                Or
                            </span>
                        </div>
                    </div>

                    <Button
                        type="button"
                        variant="helper"
                        size="lg"
                        className="w-full"
                        onClick={() => setStep("password")}
                        disabled={isLoading}>
                        Sign in with password
                    </Button>
                </div>
            )}

            {/* Step 3: Password Input */}
            {step === "password" && (
                <div className="animate-in fade-in slide-in-from-top-2 space-y-6">
                    <Controller
                        name="password"
                        control={form.control}
                        render={({ field, fieldState }) => (
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
                                        autoComplete="current-password"
                                        disabled={isLoading}
                                        rightIcon={
                                            <Button
                                                variant="helper"
                                                size="icon-sm"
                                                type="button"
                                                className="-mr-2"
                                                onClick={() =>
                                                    setTypePassword((prev) =>
                                                        prev === "password"
                                                            ? "text"
                                                            : "password",
                                                    )
                                                }>
                                                {typePassword === "password" ? (
                                                    <EyeClosed className="size-4" />
                                                ) : (
                                                    <Eye className="size-4" />
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
                        disabled={!formIsValid || isLoading}
                        rightIcon={<LogInIcon />}
                        loading={isLoading}>
                        Sign in
                    </Button>
                </div>
            )}

            {/* Step 1: Initial Continue Button */}
            {step === "email" && (
                <Button
                    size="lg"
                    type="submit"
                    variant="primary"
                    className="w-full"
                    disabled={!formIsValid || isLoading}
                    rightIcon={<ArrowRight />}
                    loading={isLoading}>
                    Continue
                </Button>
            )}
        </form>
    );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardHeader } from "@components/ui/card";
import { Checkbox } from "@components/ui/checkbox";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleIndicator,
    CollapsibleTrigger,
} from "@components/ui/collapsible";
import { FormControl } from "@components/ui/form-control";
import { Heading } from "@components/ui/heading";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Link } from "@components/ui/link";
import { MultiStep, useMultiStep } from "@components/ui/multi-step";
import { ScrollArea } from "@components/ui/scroll-area";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDebouncedCallback } from "@hooks/use-debounced-callback";
import {
    ArrowLeft,
    ArrowRight,
    CheckIcon,
    Eye,
    EyeClosed,
    LogInIcon,
} from "lucide-react";
import { signIn } from "next-auth/react";
import {
    Controller,
    FormProvider,
    useForm,
    useFormContext,
} from "react-hook-form";
import type { TODO } from "src/core/types";
import { cn } from "src/core/utils/components";
import {
    checkForEmailExistence,
    getOrganizationsByDomain,
    registerUser,
} from "src/lib/auth/fetchers";
import { z } from "zod";

import { OAuthButtons } from "./oauth";

const GetStarted = () => {
    const multiStep = useMultiStep();
    const form = useFormContext<z.infer<typeof formSchema>>();
    const emailFieldState = form.getFieldState("email", form.formState);

    const { invalid: isEmailInvalid, isDirty: isEmailFilled } = emailFieldState;

    const debouncedCallback = useDebouncedCallback((email: string) => {
        form.setValue("email", email, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
        });
    });

    const [isLoading, setIsLoading] = useState(false);

    // TODO: investigate why using form.handleSubmit was not transitioning multi step pages or showing console.logs for some reason
    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const isEmailValid = await form.trigger("email");
        if (!isEmailValid) {
            return;
        }

        setIsLoading(true);

        const email = form.getValues("email");
        const [, domain] = email.split("@");

        try {
            const matchedOrganizations = await getOrganizationsByDomain(domain);

            if (matchedOrganizations.length > 0) {
                form.setValue("foundOrganizations", matchedOrganizations);
                multiStep.navigateTo("match-domain");
            } else {
                form.setValue("foundOrganizations", []);
                multiStep.navigateTo("with-email");
            }
        } catch (error) {
            console.error("Error fetching organizations:", error);
            form.setValue("foundOrganizations", []);
            multiStep.navigateTo("with-email");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <Heading variant="h2">Get Started Now</Heading>

                <p className="text-text-secondary text-sm">
                    Start automating reviews in minutes and save hours every
                    sprint!
                </p>
            </div>

            <OAuthButtons isSignUp />

            <div className="mt-4 flex w-full flex-row items-center">
                <hr className="flex-1 border-[#6A57A433]" />
                <p className="text-text-secondary px-6 text-[13px]">
                    Or sign up with
                </p>
                <hr className="flex-1 border-[#6A57A433]" />
            </div>

            <form
                className="flex w-full flex-col gap-4"
                onSubmit={handleFormSubmit}>
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
                                    value={undefined}
                                    id={field.name}
                                    type="email"
                                    defaultValue={field.value}
                                    placeholder="Enter a corporate email address"
                                    error={fieldState.error}
                                    autoCapitalize="none"
                                    autoCorrect="off"
                                    autoComplete="email"
                                    onChange={(ev) =>
                                        debouncedCallback(ev.target.value)
                                    }
                                    disabled={
                                        formState.isSubmitting || field.disabled
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
                    rightIcon={<ArrowRight />}
                    disabled={!isEmailFilled || isEmailInvalid || isLoading}>
                    Continue
                </Button>
            </form>
        </div>
    );
};

const MatchDomain = () => {
    const multiStep = useMultiStep();
    const form = useFormContext<z.infer<typeof formSchema>>();
    const organizations = form.watch("foundOrganizations");

    const [selectedOrganization, setSelectedOrganization] = useState<
        string | undefined
    >(undefined);

    return (
        <div className="flex flex-col gap-10">
            <Button
                size="sm"
                variant="helper"
                className="text-xs"
                leftIcon={<ArrowLeft />}
                onClick={() => multiStep.navigateTo("get-started")}>
                Back to Sign Up
            </Button>

            <div className="flex flex-col gap-2">
                <Heading variant="h2">We found some organizations!</Heading>

                <p className="text-text-secondary text-sm">
                    We found organizations associated with your email domain.
                    Select one to join or create a new organization.
                </p>
            </div>

            <div className="max-h-[30vh] w-full overflow-y-auto">
                <div className="flex h-full w-full flex-col gap-2">
                    {organizations.map((org) => (
                        <Card key={org.uuid}>
                            <Collapsible className="w-full">
                                <CardHeader className="flex flex-row items-center gap-3 px-5 py-4">
                                    <Checkbox
                                        id={org.uuid}
                                        className="flex-shrink-0 self-center"
                                        checked={
                                            selectedOrganization === org.uuid
                                        }
                                        onClick={() => {
                                            setSelectedOrganization(
                                                selectedOrganization ===
                                                    org.uuid
                                                    ? ""
                                                    : org.uuid,
                                            );
                                        }}
                                    />

                                    <Label
                                        htmlFor={org.uuid}
                                        className="flex-1">
                                        {org.name}
                                    </Label>

                                    <div className="flex items-center gap-3">
                                        <CollapsibleTrigger asChild>
                                            <Button
                                                active
                                                size="icon-sm"
                                                variant="helper">
                                                <CollapsibleIndicator />
                                            </Button>
                                        </CollapsibleTrigger>
                                    </div>
                                </CardHeader>

                                <CollapsibleContent asChild className="pb-0">
                                    <CardContent className="bg-card-lv1 flex flex-col gap-5 pt-4">
                                        <p className="text-text-secondary text-sm">
                                            Owner: {org.owner}
                                        </p>
                                    </CardContent>
                                </CollapsibleContent>
                            </Collapsible>
                        </Card>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <Button
                    size="lg"
                    variant="primary"
                    className="w-full"
                    rightIcon={<ArrowRight />}
                    onClick={() => {
                        if (selectedOrganization) {
                            form.setValue(
                                "selectedOrganization",
                                selectedOrganization,
                            );
                        }
                        multiStep.navigateTo("with-email");
                    }}
                    disabled={!selectedOrganization}>
                    Continue
                </Button>

                <Button
                    size="md"
                    variant="secondary"
                    className="w-full"
                    onClick={() => {
                        form.setValue("selectedOrganization", undefined);
                        multiStep.navigateTo("with-email");
                    }}>
                    Create a new organization
                </Button>
                <div className="text-text-secondary text-center text-xs">
                    If you don't see your organization,{" "}
                    <Link
                        target="_blank"
                        href={process.env.WEB_SUPPORT_DISCORD_INVITE_URL ?? ""}>
                        contact support
                    </Link>
                    .
                </div>
            </div>
        </div>
    );
};

const WithEmail = () => {
    const multiStep = useMultiStep();
    const form = useFormContext<z.infer<typeof formSchema>>();

    const [typePassword, setTypePassword] = useState<"text" | "password">(
        "password",
    );

    const password = form.watch("password");
    const passwordRules = useMemo(
        () => ({
            hasEightChars: {
                text: "8 characters",
                valid: password?.split("").length >= 8,
            },
            hasUppercaseLetter: {
                text: "1 uppercase letter",
                valid: /[A-Z]/.test(password),
            },
            hasNumber: {
                text: "1 number",
                valid: /\d/.test(password),
            },
            hasSymbol: {
                text: "1 symbol",
                valid: /[^a-zA-Z0-9\s]/.test(password),
            },
        }),
        [password],
    );

    const { isValid: isFormValid, isSubmitting: isFormSubmitting } =
        form.formState;

    const onSubmit = form.handleSubmit(async (data) => {
        try {
            const { name, password, email, selectedOrganization } = data;

            console.log(data);

            await registerUser({
                name,
                email,
                password,
                organizationId: selectedOrganization,
            });

            await signIn("credentials", {
                email,
                password,
                redirect: true,
                redirectTo: "/setup",
            });
        } catch (err: TODO) {
            if (err?.response?.status === 409) {
                if (err?.response?.data?.error_key === "DUPLICATE_USER_EMAIL") {
                    form.setError("email", {
                        message:
                            "An account using this email address is already registered.",
                    });
                }
            }
        }
    });

    const foundOrganizations = form.watch("foundOrganizations");
    const backButtonText =
        foundOrganizations?.length > 0
            ? "Back to Organization Selection"
            : "Back to Sign Up";

    const handleBack = () => {
        if (foundOrganizations?.length > 0) {
            multiStep.navigateTo("match-domain");
        } else {
            multiStep.navigateTo("get-started");
        }
    };

    return (
        <div className="flex flex-col gap-10">
            <Button
                size="sm"
                variant="helper"
                className="text-xs"
                leftIcon={<ArrowLeft />}
                onClick={handleBack}>
                {backButtonText}
            </Button>

            <div className="flex flex-col gap-2">
                <Heading variant="h2">Sign up with e-mail</Heading>

                <p className="text-text-secondary text-sm">
                    Start automating reviews in minutes and save hours every
                    sprint!
                </p>
            </div>

            <form className="flex flex-col gap-6" onSubmit={onSubmit}>
                <Controller
                    name="name"
                    control={form.control}
                    render={({ field, fieldState, formState }) => (
                        <FormControl.Root>
                            <FormControl.Label htmlFor={field.name}>
                                How can we call you?
                            </FormControl.Label>

                            <FormControl.Input>
                                <Input
                                    {...field}
                                    id={field.name}
                                    placeholder="Enter your name"
                                    error={fieldState.error}
                                    autoCapitalize="none"
                                    autoCorrect="off"
                                    autoComplete="given-name"
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
                                    placeholder="Create your password"
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
                                            size="icon-sm"
                                            variant="helper"
                                            type="button"
                                            className="-mr-2"
                                            onClick={() =>
                                                setTypePassword(
                                                    (typePassword) =>
                                                        typePassword ===
                                                        "password"
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

                            <FormControl.Helper className="mt-2 flex flex-col gap-1">
                                <span>You must have at least:</span>
                                <div className="flex flex-row flex-wrap gap-1">
                                    {Object.values(passwordRules).map(
                                        (rule, index) => (
                                            <div
                                                key={index}
                                                className={cn(
                                                    "flex items-center gap-1 rounded-full px-2 py-1",
                                                    "border border-[#6A57A433]",
                                                    rule.valid &&
                                                        "border-success/20",
                                                )}>
                                                <div className="w-3 text-center">
                                                    {rule.valid ? (
                                                        <CheckIcon className="text-success size-3" />
                                                    ) : (
                                                        <span>•</span>
                                                    )}
                                                </div>

                                                <span
                                                    className={cn(
                                                        rule.valid &&
                                                            "text-success-foreground",
                                                    )}>
                                                    {rule.text}
                                                </span>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </FormControl.Helper>
                        </FormControl.Root>
                    )}
                />

                <Controller
                    name="confirmPassword"
                    control={form.control}
                    render={({ field, fieldState, formState }) => (
                        <FormControl.Root>
                            <FormControl.Label htmlFor={field.name}>
                                Confirm Password
                            </FormControl.Label>

                            <FormControl.Input>
                                <Input
                                    {...field}
                                    id={field.name}
                                    type="password"
                                    placeholder="Re-enter your password"
                                    error={fieldState.error}
                                    autoCapitalize="none"
                                    autoCorrect="off"
                                    autoComplete="off"
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

                <Button
                    size="lg"
                    type="submit"
                    variant="primary"
                    className="w-full"
                    disabled={!isFormValid}
                    rightIcon={<LogInIcon />}
                    loading={isFormSubmitting}>
                    Sign up
                </Button>

                <div className="text-text-secondary mt-4 text-center text-xs">
                    By signing up, you agree to the{" "}
                    <Link
                        target="blank"
                        href={process.env.WEB_TERMS_AND_CONDITIONS ?? ""}>
                        Terms & Conditions.
                    </Link>
                </div>
            </form>
        </div>
    );
};

const formSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(1, { message: "Enter your name" })
            .regex(/^[\p{L}\s'-]+$/u, {
                message:
                    "Name can only contain letters, spaces, hyphens and apostrophes",
            }),
        email: z
            .string()
            .min(1, { message: "Enter your email" })
            .email({ message: "Invalid email address" })
            .refine(
                (email) => {
                    const [, domain] = email.split("@");
                    return (
                        domain &&
                        ![
                            "gmail.com",
                            "hotmail.com",
                            "hotmail.com.br",
                            "outlook.com",
                            "outlook.com.br",
                            "yahoo.com",
                        ].includes(domain.toLowerCase())
                    );
                },
                { message: "Please use a corporate email address" },
            )
            .refine(async (email) => {
                try {
                    await checkForEmailExistence(email);
                    return true;
                } catch (error) {
                    console.error("Error checking email existence:", error);
                    return false;
                }
            }, "The email is already in use"),
        password: z
            .string({ required_error: "Enter a password" })
            .min(8, { message: "Invalid password" })
            .regex(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
                message:
                    "Password must include at least 1 uppercase letter, 1 number, and 1 special character",
            }),
        confirmPassword: z.string({ required_error: "Confirm your password" }),
        foundOrganizations: z.array(
            z.object({
                uuid: z.string(),
                name: z.string(),
                owner: z.string().optional(),
            }),
        ),
        selectedOrganization: z.string().optional(),
    })

    .superRefine(({ confirmPassword, password }, ctx) => {
        if (confirmPassword !== password) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Passwords must match",
                path: ["confirmPassword"],
            });
        }
    });

export const RegisterPageContent = () => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema, { async: true }, { mode: "async" }),
        mode: "all",
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            foundOrganizations: [],
            selectedOrganization: "",
        },
    });

    return (
        <FormProvider {...form}>
            <MultiStep
                initialStep="get-started"
                steps={{
                    "get-started": GetStarted,
                    "match-domain": MatchDomain,
                    "with-email": WithEmail,
                }}
            />
        </FormProvider>
    );
};

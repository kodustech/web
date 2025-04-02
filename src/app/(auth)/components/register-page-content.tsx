"use client";

import { useMemo, useState } from "react";
import { Button } from "@components/ui/button";
import { FormControl } from "@components/ui/form-control";
import { Heading } from "@components/ui/heading";
import { SvgCheckList } from "@components/ui/icons/SvgCheckList";
import { Input } from "@components/ui/input";
import { Link } from "@components/ui/link";
import { MultiStep, useMultiStep } from "@components/ui/multi-step";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDebouncedCallback } from "@hooks/use-debounced-callback";
import { ArrowLeft, ArrowRight, Eye, EyeClosed, LogInIcon } from "lucide-react";
import { signIn } from "next-auth/react";
import {
    Controller,
    FormProvider,
    useForm,
    useFormContext,
} from "react-hook-form";
import type { TODO } from "src/core/types";
import { cn } from "src/core/utils/components";
import { checkForEmailExistence, registerUser } from "src/lib/auth/fetchers";
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

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <Heading variant="h2">Get Started Now</Heading>

                <p className="text-sm text-muted-foreground">
                    Start automating reviews in minutes and save hours every
                    sprint!
                </p>
            </div>

            <OAuthButtons isSignUp />

            <div className="mt-4 flex w-full flex-row items-center">
                <hr className="flex-1 border-[#6A57A433]" />
                <p className="px-6 text-[13px] text-muted-foreground">
                    Or sign up with
                </p>
                <hr className="flex-1 border-[#6A57A433]" />
            </div>

            <form
                className="flex w-full flex-col gap-4"
                onSubmit={(ev) => {
                    ev.preventDefault();
                    multiStep.navigateTo("with-email");
                }}>
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
                    rightIcon={<ArrowRight />}
                    disabled={!isEmailFilled || isEmailInvalid}>
                    Continue
                </Button>
            </form>
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
            const { name, password, email } = data;

            await registerUser({ name, email, password });

            await signIn("credentials", {
                email,
                password,
                redirect: true,
                redirectTo: "/setup",
            });
        } catch (err: TODO) {
            console.log(err);

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

    return (
        <div className="flex flex-col gap-10">
            <Link
                href=""
                onClick={(ev) => {
                    ev.preventDefault();
                    multiStep.back();
                }}
                className="flex w-fit items-center gap-2 text-xs text-muted-foreground">
                <ArrowLeft className="size-4" /> Back to Sign Up methods
            </Link>

            <div className="flex flex-col gap-2">
                <Heading variant="h2">Sign up with e-mail</Heading>

                <p className="text-sm text-muted-foreground">
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
                                <div className="relative">
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
                                    />

                                    <Button
                                        type="button"
                                        className={cn(
                                            "absolute right-4 top-4 h-auto bg-transparent p-0 hover:cursor-pointer hover:bg-transparent",
                                            "focus-visible:border-[#F5922080] focus-visible:outline-none focus-visible:ring-[#F5922080]",
                                        )}
                                        onClick={() =>
                                            setTypePassword((typePassword) =>
                                                typePassword === "password"
                                                    ? "text"
                                                    : "password",
                                            )
                                        }>
                                        {typePassword === "password" ? (
                                            <EyeClosed className="size-5 text-white" />
                                        ) : (
                                            <Eye className="size-5 text-white" />
                                        )}
                                    </Button>
                                </div>
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
                                                        "border-success border-opacity-20",
                                                )}>
                                                <div className="w-3 text-center">
                                                    {rule.valid ? (
                                                        <SvgCheckList />
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
                    disabled={!isFormValid}
                    rightIcon={<LogInIcon />}
                    loading={isFormSubmitting}>
                    Sign up
                </Button>

                <div className="mt-4 text-center text-xs text-muted-foreground">
                    By signing up, you agree to the{" "}
                    <Link
                        target="blank"
                        href={process.env.WEB_TERMS_AND_CONDITIONS ?? ""}
                        className={cn(
                            "whitespace-nowrap text-xs font-medium !text-brand-orange underline underline-offset-4",
                        )}>
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
        },
    });

    return (
        <FormProvider {...form}>
            <MultiStep
                initialStep="get-started"
                steps={{
                    "get-started": GetStarted,
                    "with-email": WithEmail,
                }}
            />
        </FormProvider>
    );
};

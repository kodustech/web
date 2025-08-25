"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@components/ui/button";
import { Collapsible, CollapsibleContent } from "@components/ui/collapsible";
import { FormControl } from "@components/ui/form-control";
import { Heading } from "@components/ui/heading";
import { SvgKodus } from "@components/ui/icons/SvgKodus";
import { Input } from "@components/ui/input";
import { Link } from "@components/ui/link";
import { Page } from "@components/ui/page";
import { PhoneInput } from "@components/ui/phone-input";
import { Switch } from "@components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { createOrUpdateOrganizationParameter } from "@services/organizationParameters/fetch";
import { useUpdateOrganizationInfos } from "@services/organizations/hooks";
import { OrganizationParametersConfigKey } from "@services/parameters/types";
import { ArrowRight } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { isValidPhoneNumber } from "react-phone-number-input";
import { useAuth } from "src/core/providers/auth.provider";
import { publicDomainsSet } from "src/core/utils/email";
import { useOrganizationContext } from "src/features/organization/_providers/organization-context";
import { z } from "zod";

import { StepIndicators } from "../_components/step-indicators";
import { useGoToStep } from "../_hooks/use-goto-step";

const createFormSchema = (userDomain: string) =>
    z
        .object({
            organizationName: z
                .string()
                .min(1, { message: "What's your organization's name?" }),
            phone: z
                .string()
                .refine(isValidPhoneNumber, { message: "Invalid phone number" })
                .or(z.literal(""))
                .optional(),
            autoJoin: z.boolean().optional(),
            autoJoinDomains: z
                .array(
                    z.string().refine(
                        (value) => {
                            if (!value) return true;
                            return /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
                        },
                        {
                            message: "Invalid domain format",
                        },
                    ),
                )
                .optional(),
        })
        .superRefine((data, ctx) => {
            if (data.autoJoin) {
                const domains = data.autoJoinDomains ?? [];
                const validDomains = domains.filter((d) => d);

                if (validDomains.length === 0) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message:
                            "At least one domain is required when auto-join is enabled.",
                        path: ["autoJoinDomains"],
                    });
                    return;
                }

                const lowerCaseDomains = domains.map((d) => d.toLowerCase());
                const isPublicDomain = lowerCaseDomains.some((d) =>
                    publicDomainsSet.has(d),
                );

                if (isPublicDomain) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message:
                            "Public email domains like gmail.com are not allowed.",
                        path: ["autoJoinDomains"],
                    });
                }

                const hasMismatchedDomain = validDomains.some(
                    (domain) => domain !== userDomain,
                );
                if (hasMismatchedDomain) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "You can only add your own domain.",
                        path: ["autoJoinDomains"],
                    });
                }
            }
        });

export default function App() {
    useGoToStep();

    const router = useRouter();
    const { organizationId, organizationName } = useOrganizationContext();
    const { mutateAsync } = useUpdateOrganizationInfos();
    const { email } = useAuth();

    const domain = email?.split("@")[1] || "";

    const formSchema = createFormSchema(domain);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        mode: "all",
        defaultValues: {
            phone: "",
            organizationName,
            autoJoin: true,
            autoJoinDomains: [domain],
        },
    });

    const { trigger } = form;

    // Trigger validation on mount to validate default values
    useEffect(() => {
        trigger();
    }, [trigger]);

    const onSubmit = form.handleSubmit(async (data) => {
        await mutateAsync({
            name: data.organizationName,
            phone: data.phone,
        });

        const uniqueDomains = data.autoJoin
            ? [...new Set(data.autoJoinDomains?.filter((d) => d) ?? [])]
            : [];

        await createOrUpdateOrganizationParameter(
            OrganizationParametersConfigKey.AUTO_JOIN_CONFIG,
            {
                enabled: data.autoJoin,
                domains: uniqueDomains,
            },
            organizationId,
        );

        router.push("/setup/connecting-git-tool");
    });

    const { isSubmitting, isValid } = form.formState;

    const autoJoinEnabled = form.watch("autoJoin");

    return (
        <Page.Root className="mx-auto flex max-h-screen flex-row overflow-hidden p-6">
            <div className="bg-card-lv1 flex flex-10 flex-col justify-center gap-10 rounded-3xl p-12">
                <SvgKodus className="h-8 min-h-8" />

                <div className="flex-1 overflow-hidden rounded-3xl">
                    <video
                        loop
                        muted
                        autoPlay
                        playsInline
                        disablePictureInPicture
                        className="h-full w-full object-contain"
                        src="/assets/videos/setup/learn-with-your-context.webm"
                    />
                </div>
            </div>

            <div className="flex flex-14 flex-col justify-center gap-20 p-10">
                <div className="flex flex-col items-center gap-10">
                    <div className="flex max-w-96 flex-col gap-10">
                        <StepIndicators.Root>
                            <StepIndicators.Item status="active" />
                            <StepIndicators.Item />
                            <StepIndicators.Item />
                        </StepIndicators.Root>

                        <div className="flex flex-col gap-2">
                            <Heading variant="h2">
                                Let's create a Workspace
                            </Heading>

                            <p className="text-text-secondary text-sm">
                                Tell us about your team to customize Kody for
                                your workflows.
                            </p>
                        </div>

                        <form
                            onSubmit={onSubmit}
                            className="flex w-full flex-col gap-8">
                            <Controller
                                name="organizationName"
                                control={form.control}
                                render={({ field, fieldState, formState }) => (
                                    <FormControl.Root>
                                        <FormControl.Label htmlFor={field.name}>
                                            Organization Name
                                        </FormControl.Label>

                                        <FormControl.Input>
                                            <Input
                                                {...field}
                                                id={field.name}
                                                type="text"
                                                maxLength={100}
                                                placeholder="Enter the organization you work for"
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
                                name="phone"
                                control={form.control}
                                render={({ field, fieldState, formState }) => (
                                    <FormControl.Root>
                                        <FormControl.Label htmlFor={field.name}>
                                            Phone{" "}
                                            <small className="text-text-secondary">
                                                (optional)
                                            </small>
                                        </FormControl.Label>

                                        <FormControl.Input>
                                            <PhoneInput
                                                {...field}
                                                id={field.name}
                                                placeholder="Add a phone number for faster support"
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

                                        <FormControl.Helper>
                                            Use country code or select a country
                                            before typing
                                        </FormControl.Helper>
                                    </FormControl.Root>
                                )}
                            />
                            <Collapsible
                                open={autoJoinEnabled}
                                className="border-border space-y-4 rounded-lg border p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col pr-4">
                                        <FormControl.Label htmlFor="autoJoinSwitch">
                                            Enable Auto Join
                                        </FormControl.Label>
                                        <FormControl.Helper className="mt-1">
                                            Allow anyone with an approved email
                                            domain to join.
                                        </FormControl.Helper>
                                    </div>

                                    <Controller
                                        name="autoJoin"
                                        control={form.control}
                                        render={({ field }) => (
                                            <Switch
                                                id="autoJoinSwitch"
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        )}
                                    />
                                </div>

                                <CollapsibleContent>
                                    <Controller
                                        name="autoJoinDomains"
                                        control={form.control}
                                        render={({
                                            field,
                                            fieldState,
                                            formState,
                                        }) => (
                                            <FormControl.Root>
                                                <FormControl.Label
                                                    htmlFor={field.name}>
                                                    Approved Domains
                                                </FormControl.Label>
                                                <FormControl.Input>
                                                    <Input
                                                        {...field}
                                                        id={field.name}
                                                        value={
                                                            field.value?.join(
                                                                ",",
                                                            ) ?? ""
                                                        }
                                                        onChange={(e) => {
                                                            const inputValue =
                                                                e.target.value;

                                                            if (
                                                                inputValue ===
                                                                ""
                                                            ) {
                                                                field.onChange(
                                                                    [],
                                                                );
                                                                return;
                                                            }

                                                            const domains =
                                                                e.target.value
                                                                    .split(
                                                                        /,\s*/,
                                                                    )
                                                                    .map((d) =>
                                                                        d.trim(),
                                                                    );
                                                            field.onChange(
                                                                domains,
                                                            );
                                                        }}
                                                        placeholder="e.g., yourcompany.com"
                                                        error={fieldState.error}
                                                        disabled={
                                                            formState.isSubmitting
                                                        }
                                                    />
                                                </FormControl.Input>
                                                <FormControl.Helper className="mt-1">
                                                    Separate multiple domains
                                                    with a comma.
                                                </FormControl.Helper>{" "}
                                                <FormControl.Error>
                                                    {fieldState.error?.message}
                                                </FormControl.Error>
                                            </FormControl.Root>
                                        )}
                                    />
                                </CollapsibleContent>
                            </Collapsible>

                            <Button
                                size="lg"
                                variant="primary"
                                type="submit"
                                className="w-full"
                                rightIcon={<ArrowRight />}
                                disabled={!isValid}
                                loading={isSubmitting}>
                                Next
                            </Button>
                        </form>

                        <Link
                            href="/setup/connecting-git-tool"
                            className="self-center text-sm">
                            Skip this step for now
                        </Link>
                    </div>
                </div>
            </div>
        </Page.Root>
    );
}

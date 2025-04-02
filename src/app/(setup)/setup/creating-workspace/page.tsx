"use client";

import { useRouter } from "next/navigation";
import { Button } from "@components/ui/button";
import { FormControl } from "@components/ui/form-control";
import { Heading } from "@components/ui/heading";
import { SvgKodus } from "@components/ui/icons/SvgKodus";
import { Input } from "@components/ui/input";
import { Link } from "@components/ui/link";
import { Page } from "@components/ui/page";
import { PhoneInput } from "@components/ui/phone-input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateOrganizationInfos } from "@services/organizations/hooks";
import { ArrowRight } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { isValidPhoneNumber } from "react-phone-number-input";
import { useOrganizationContext } from "src/features/organization/_providers/organization-context";
import { z } from "zod";

import { StepIndicators } from "../_components/step-indicators";
import { useGoToStep } from "../_hooks/use-goto-step";

const formSchema = z.object({
    organizationName: z
        .string()
        .min(1, { message: "What's your organization's name?" }),
    phone: z
        .string()
        .refine(isValidPhoneNumber, { message: "Invalid phone number" })
        .or(z.literal(""))
        .optional(),
});
export default function App() {
    useGoToStep();

    const router = useRouter();
    const { organizationName } = useOrganizationContext();
    const { mutateAsync } = useUpdateOrganizationInfos();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        mode: "all",
        defaultValues: {
            phone: "",
            organizationName,
        },
    });

    const onSubmit = form.handleSubmit(async (data) => {
        await mutateAsync({
            name: data.organizationName,
            phone: data.phone,
        });

        router.push("/setup/connecting-git-tool");
    });

    const { isSubmitting, isValid } = form.formState;

    return (
        <Page.Root className="mx-auto flex max-h-screen flex-row overflow-hidden p-6">
            <div className="flex flex-[10] flex-col justify-center gap-10 rounded-3xl bg-[#231B2E]/35 p-12 backdrop-blur">
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

            <div className="flex flex-[14] flex-col justify-center gap-20 p-10">
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

                            <p className="text-sm text-muted-foreground">
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
                                            <small className="text-muted-foreground">
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

                            <Button
                                size="lg"
                                type="submit"
                                rightIcon={<ArrowRight />}
                                disabled={!isValid}
                                loading={isSubmitting}>
                                Next
                            </Button>
                        </form>

                        <Link
                            href="/setup/connecting-git-tool"
                            className="w-fit self-center">
                            Skip this step for now
                        </Link>
                    </div>
                </div>
            </div>
        </Page.Root>
    );
}

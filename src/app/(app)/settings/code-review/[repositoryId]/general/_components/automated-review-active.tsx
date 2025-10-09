"use client";

import { Button } from "@components/ui/button";
import { Card, CardContent, CardHeader } from "@components/ui/card";
import { Collapsible, CollapsibleContent } from "@components/ui/collapsible";
import { FormControl } from "@components/ui/form-control";
import { Heading } from "@components/ui/heading";
import { InlineCode } from "@components/ui/inline-code";
import { NumberInput } from "@components/ui/number-input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@components/ui/select";
import { Separator } from "@components/ui/separator";
import { Switch } from "@components/ui/switch";
import { Controller, useFormContext } from "react-hook-form";
import { OverrideIndicatorForm } from "src/app/(app)/settings/code-review/_components/override";

import { ReviewCadenceType, type CodeReviewFormType } from "../../../_types";

export const AutomatedReviewActive = () => {
    const form = useFormContext<CodeReviewFormType>();
    const reviewCadenceType = form.watch("reviewCadence.type.value");

    return (
        <Controller
            name="automatedReviewActive.value"
            control={form.control}
            render={({ field }) => (
                <Card>
                    <Collapsible open={field.value}>
                        <Button
                            size="sm"
                            variant="helper"
                            className="w-full"
                            disabled={field.disabled}
                            onClick={() => {
                                const newValue = !field.value;
                                field.onChange(newValue);

                                if (newValue) {
                                    const currentCadence = form.getValues(
                                        "reviewCadence.type.value",
                                    );

                                    if (!currentCadence) {
                                        form.setValue(
                                            "reviewCadence.type.value",
                                            ReviewCadenceType.AUTOMATIC,
                                            { shouldDirty: true },
                                        );
                                    }

                                    form.trigger();
                                } else {
                                    form.resetField("reviewCadence");

                                    form.trigger();
                                }
                            }}>
                            <CardHeader className="flex flex-row items-center justify-between gap-6">
                                <div className="flex flex-col gap-1">
                                    <div className="flex flex-row items-center gap-2">
                                        <Heading variant="h3">
                                            Enable Automated Code Review
                                        </Heading>

                                        <OverrideIndicatorForm fieldName="automatedReviewActive" />
                                    </div>
                                    <p className="text-text-secondary text-sm">
                                        Whenever a Pull Request is opened, Kody
                                        will automatically review the code,
                                        highlighting improvements, issues, and
                                        suggestions to ensure code quality.
                                    </p>

                                    <p className="text-text-tertiary text-xs">
                                        When disabled, you can manually start
                                        the review by using the command{" "}
                                        <InlineCode>
                                            @kody start-review
                                        </InlineCode>{" "}
                                        in the Pull Request comments.
                                    </p>
                                </div>

                                <Switch decorative checked={field.value} />
                            </CardHeader>
                        </Button>
                        <CollapsibleContent className="*:pb-2">
                            <CardContent className="px-10">
                                <Controller
                                    name="reviewCadence.type.value"
                                    control={form.control}
                                    render={({ field }) => (
                                        <FormControl.Root>
                                          <div className="flex flex-row items-center gap-2 mb-2">
                                            <FormControl.Label
                                                htmlFor={field.name}
                                                className="mb-0">
                                                Review Cadence
                                            </FormControl.Label>

                                            <OverrideIndicatorForm fieldName="reviewCadence.type" />

                                            <FormControl.Helper className="text-text-secondary mt-0 mb-2 text-xs">
                                                Decide how Kody should run
                                                follow-up reviews after the
                                                first one.
                                            </FormControl.Helper>

                                            <FormControl.Input>
                                                <Select
                                                    value={field.value}
                                                    disabled={field.disabled}
                                                    onValueChange={
                                                        field.onChange
                                                    }>
                                                    <SelectTrigger
                                                        size="md"
                                                        id={field.name}>
                                                        <SelectValue placeholder="Select review cadence" />
                                                    </SelectTrigger>

                                                    <SelectContent>
                                                        <SelectItem
                                                            className="min-h-auto py-2 pl-4 text-sm"
                                                            value={
                                                                ReviewCadenceType.AUTOMATIC
                                                            }>
                                                            Automatic
                                                        </SelectItem>

                                                        <SelectItem
                                                            className="min-h-auto py-2 pl-4 text-sm"
                                                            value={
                                                                ReviewCadenceType.AUTO_PAUSE
                                                            }>
                                                            Auto-pause
                                                        </SelectItem>

                                                        <SelectItem
                                                            className="min-h-auto py-2 pl-4 text-sm"
                                                            value={
                                                                ReviewCadenceType.MANUAL
                                                            }>
                                                            Manual
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormControl.Input>

                                            <FormControl.Helper className="text-text-secondary text-xs">
                                                {field.value ===
                                                    ReviewCadenceType.AUTOMATIC &&
                                                    "Review every new push"}

                                                {field.value ===
                                                    ReviewCadenceType.AUTO_PAUSE &&
                                                    "Pause if a push burst is detected"}

                                                {field.value ===
                                                    ReviewCadenceType.MANUAL && (
                                                    <>
                                                        Only run when you
                                                        comment{" "}
                                                        <InlineCode>
                                                            @kody start-review
                                                        </InlineCode>
                                                    </>
                                                )}
                                            </FormControl.Helper>
                                        </FormControl.Root>
                                    )}
                                />

                                {reviewCadenceType ===
                                    ReviewCadenceType.AUTO_PAUSE && (
                                    <div className="mt-6 flex flex-row gap-8">
                                        <Controller
                                            name="reviewCadence.pushesToTrigger.value"
                                            control={form.control}
                                            render={({ field, fieldState }) => (
                                                <FormControl.Root>
                                                    <FormControl.Label
                                                        htmlFor={field.name}>
                                                        Pushes to trigger pause
                                                    </FormControl.Label>

                                                    <OverrideIndicatorForm fieldName="reviewCadence.pushesToTrigger" />

                                                    <FormControl.Input>
                                                        <NumberInput.Root
                                                            min={1}
                                                            size="md"
                                                            className="w-52"
                                                            value={
                                                                field.value || 3
                                                            }
                                                            disabled={
                                                                field.disabled
                                                            }
                                                            onValueChange={
                                                                field.onChange
                                                            }>
                                                            <NumberInput.Decrement />
                                                            <NumberInput.Input
                                                                id={field.name}
                                                                error={
                                                                    fieldState.error
                                                                }
                                                            />
                                                            <NumberInput.Increment />
                                                        </NumberInput.Root>
                                                    </FormControl.Input>
                                                </FormControl.Root>
                                            )}
                                        />

                                        <Separator orientation="vertical" />

                                        <Controller
                                            name="reviewCadence.timeWindow.value"
                                            control={form.control}
                                            render={({ field, fieldState }) => (
                                                <FormControl.Root>
                                                    <FormControl.Label
                                                        htmlFor={field.name}>
                                                        Time window (minutes)
                                                    </FormControl.Label>

                                                    <OverrideIndicatorForm fieldName="reviewCadence.timeWindow" />

                                                    <FormControl.Input>
                                                        <NumberInput.Root
                                                            min={1}
                                                            size="md"
                                                            className="w-52"
                                                            value={
                                                                field.value ||
                                                                15
                                                            }
                                                            disabled={
                                                                field.disabled
                                                            }
                                                            onValueChange={
                                                                field.onChange
                                                            }>
                                                            <NumberInput.Decrement />
                                                            <NumberInput.Input
                                                                id={field.name}
                                                                error={
                                                                    fieldState.error
                                                                }
                                                            />
                                                            <NumberInput.Increment />
                                                        </NumberInput.Root>
                                                    </FormControl.Input>
                                                </FormControl.Root>
                                            )}
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </CollapsibleContent>
                    </Collapsible>
                </Card>
            )}
        />
    );
};

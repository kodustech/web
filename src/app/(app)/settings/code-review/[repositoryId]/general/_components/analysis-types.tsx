"use client";

import { useEffect, useRef } from "react";
import { Button } from "@components/ui/button";
import { Checkbox } from "@components/ui/checkbox";
import { FormControl } from "@components/ui/form-control";
import { Heading } from "@components/ui/heading";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import {
    useGetAllCodeReviewLabels,
    useGetCodeReviewLabels,
} from "@services/parameters/hooks";
import { Controller, useFormContext } from "react-hook-form";

import type { CodeReviewFormType, CodeReviewOptions } from "../../../_types";

// Dynamic mapping - no need for fixed keys anymore
const mapReviewOptionsToValues = (
    reviewOptions: CodeReviewOptions,
): Record<string, boolean> => {
    return { ...reviewOptions };
};

const mapToReviewOptions = (
    values: Record<string, boolean> = {},
): CodeReviewOptions => {
    return { ...values };
};

interface CheckboxCardOption {
    value: string;
    name: string;
    description: string;
}

export const AnalysisTypes = () => {
    const form = useFormContext<CodeReviewFormType>();
    const codeReviewVersion = form.watch("codeReviewVersion") || "legacy";
    const { data: labels = [], isLoading } =
        useGetCodeReviewLabels(codeReviewVersion);
    const {
        v1,
        v2,
        isLoading: allLabelsLoading,
        allLabels,
    } = useGetAllCodeReviewLabels();
    const initializedRef = useRef(false);

    // Merge all categories ensuring boolean values - keep user's existing values
    useEffect(() => {
        if (
            allLabels.length > 0 &&
            !allLabelsLoading &&
            !initializedRef.current
        ) {
            const currentOptions = form.getValues("reviewOptions");
            const mergedOptions: Record<string, boolean> = {};

            // Add all categories from both versions with their current values or false as default
            allLabels.forEach((label) => {
                mergedOptions[label.type] = Boolean(
                    currentOptions[label.type] ?? false,
                );
            });

            form.setValue("reviewOptions", mergedOptions);
            initializedRef.current = true;
        }
    }, [allLabels.length, allLabelsLoading]); // Only run once when labels are loaded

    const reviewOptionsOptions: CheckboxCardOption[] = labels.map(
        (label: any) => ({
            value: label.type,
            name: label.name,
            description: label.description,
        }),
    );

    if (isLoading || allLabelsLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="text-text-secondary">Loading categories...</div>
            </div>
        );
    }

    return (
        <Controller
            name="reviewOptions"
            control={form.control}
            render={({ field }) => (
                <FormControl.Root className="@container space-y-1">
                    <FormControl.Input>
                        <ToggleGroup.Root
                            id={field.name}
                            type="multiple"
                            disabled={field.disabled}
                            className="grid auto-rows-fr grid-cols-1 gap-2 @lg:grid-cols-2 @3xl:grid-cols-3"
                            value={(() => {
                                const validOptions = labels.map(
                                    (label) => label.type,
                                );
                                const mappedValues = mapReviewOptionsToValues(
                                    mapToReviewOptions(field.value),
                                );

                                return Object.entries(mappedValues)
                                    .filter(
                                        ([key, value]) =>
                                            validOptions.includes(key) && value,
                                    )
                                    .map(([key]) => key);
                            })()}
                            onValueChange={(values) => {
                                // Keep all existing categories from both versions, only update current version
                                const currentOptions =
                                    form.getValues("reviewOptions") || {};
                                const currentVersionOptions = labels.map(
                                    (label) => label.type,
                                );

                                // Start with all existing options
                                const updatedOptions: Record<string, boolean> =
                                    { ...currentOptions };

                                // Update only the current version's categories
                                currentVersionOptions.forEach((option) => {
                                    updatedOptions[option] =
                                        values.includes(option);
                                });

                                field.onChange(updatedOptions);
                            }}>
                            {reviewOptionsOptions.map((option) => (
                                <ToggleGroup.ToggleGroupItem
                                    asChild
                                    key={option.value}
                                    value={option.value}>
                                    <Button
                                        size="lg"
                                        variant="helper"
                                        className="w-full items-start py-5">
                                        <div className="flex w-full flex-row justify-between gap-6">
                                            <div className="flex flex-col gap-2">
                                                <Heading
                                                    variant="h3"
                                                    className="truncate">
                                                    {option.name}
                                                </Heading>

                                                <p className="text-text-secondary text-xs">
                                                    {option.description}
                                                </p>
                                            </div>

                                            <Checkbox
                                                decorative
                                                checked={
                                                    field.value?.[
                                                        option.value
                                                    ] || false
                                                }
                                            />
                                        </div>
                                    </Button>
                                </ToggleGroup.ToggleGroupItem>
                            ))}
                        </ToggleGroup.Root>
                    </FormControl.Input>
                </FormControl.Root>
            )}
        />
    );
};

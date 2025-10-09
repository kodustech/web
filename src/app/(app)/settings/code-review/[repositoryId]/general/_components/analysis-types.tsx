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
import {
    useCodeReviewRouteParams,
    useCurrentConfigLevel,
} from "src/app/(app)/settings/_hooks";

import { FormattedConfigLevel, type CodeReviewFormType } from "../../../_types";

interface CheckboxCardOption {
    value: string;
    name: string;
    description: string;
}

export const AnalysisTypes = () => {
    const currentLevel = useCurrentConfigLevel();
    const form = useFormContext<CodeReviewFormType>();
    const codeReviewVersion = form.watch("codeReviewVersion.value") || "v2";
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
            const currentOptions = form.getValues("reviewOptions") || {};
            const mergedOptions = { ...currentOptions };

            // Add all categories from both versions with their current values or false as default
            allLabels.forEach((label) => {
                if (!mergedOptions[label.type]) {
                    mergedOptions[label.type] = {
                        value: false,
                        level: FormattedConfigLevel.DEFAULT,
                    };
                }
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
                            value={Object.entries(field.value || {})
                                .filter(([, prop]) => prop.value)
                                .map(([key]) => key)}
                            onValueChange={(values) => {
                                const currentOptions =
                                    form.getValues("reviewOptions") || {};
                                const currentVersionOptions = labels.map(
                                    (label) => label.type,
                                );

                                const updatedOptions = { ...currentOptions };

                                currentVersionOptions.forEach((option) => {
                                    const isSelected = values.includes(option);
                                    const existingOption =
                                        updatedOptions[option];

                                    if (existingOption) {
                                        updatedOptions[option] = {
                                            ...existingOption,
                                            value: isSelected,
                                            level: currentLevel,
                                        };
                                    } else {
                                        updatedOptions[option] = {
                                            value: isSelected,
                                            level: currentLevel,
                                        };
                                    }
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
                                                    field.value?.[option.value]
                                                        ?.value || false
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

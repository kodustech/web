"use client";

import { Button } from "@components/ui/button";
import { Checkbox } from "@components/ui/checkbox";
import { FormControl } from "@components/ui/form-control";
import { Heading } from "@components/ui/heading";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { useSuspenseGetCodeReviewLabels } from "@services/parameters/hooks";
import { Controller, useFormContext } from "react-hook-form";

import type { CodeReviewFormType, CodeReviewOptions } from "../../../_types";

const labelTypeToKey: Record<string, keyof CodeReviewOptions> = {
    performance_and_optimization: "performance_and_optimization",
    security: "security",
    error_handling: "error_handling",
    refactoring: "refactoring",
    maintainability: "maintainability",
    potential_issues: "potential_issues",
    code_style: "code_style",
    documentation_and_comments: "documentation_and_comments",
    kody_rules: "kody_rules",
    breaking_changes: "breaking_changes",
};

const mapReviewOptionsToValues = (
    reviewOptions: CodeReviewOptions,
): Record<string, boolean> => {
    const values: Record<string, boolean> = {};
    Object.keys(labelTypeToKey).forEach((key) => {
        const optionKey = labelTypeToKey[key];
        values[key] = reviewOptions[optionKey];
    });

    return values;
};

const mapToReviewOptions = (
    values: Record<string, boolean> = {},
): CodeReviewOptions => {
    const options: Partial<CodeReviewOptions> = {};

    Object.keys(values).forEach((key) => {
        const mappedKey = labelTypeToKey[key];
        if (mappedKey) {
            options[mappedKey] = values[key];
        } else {
            console.warn(`Chave não mapeada: ${key}`);
        }
    });

    return {
        security: options.security || false,
        code_style: options.code_style || false,
        refactoring: options.refactoring || false,
        error_handling: options.error_handling || false,
        maintainability: options.maintainability || false,
        potential_issues: options.potential_issues || false,
        documentation_and_comments: options.documentation_and_comments || false,
        performance_and_optimization:
            options.performance_and_optimization || false,
        kody_rules: options.kody_rules || false,
        breaking_changes: options.breaking_changes || false,
    };
};

interface CheckboxCardOption {
    value: string;
    name: string;
    description: string;
}

export const AnalysisTypes = () => {
    const form = useFormContext<CodeReviewFormType>();
    const labels = useSuspenseGetCodeReviewLabels();
    const reviewOptionsOptions: CheckboxCardOption[] = labels.map(
        (label: any) => ({
            value: label.type,
            name: label.name,
            description: label.description,
        }),
    );

    return (
        <Controller
            name="reviewOptions"
            control={form.control}
            render={({ field }) => (
                <FormControl.Root className="@container space-y-1">
                    <FormControl.Label htmlFor={field.name}>
                        Analysis types
                    </FormControl.Label>

                    <FormControl.Input>
                        <ToggleGroup.Root
                            id={field.name}
                            type="multiple"
                            disabled={field.disabled}
                            className="grid auto-rows-fr grid-cols-1 gap-2 @lg:grid-cols-2 @3xl:grid-cols-3"
                            value={Object.entries(
                                mapReviewOptionsToValues(
                                    mapToReviewOptions(field.value),
                                ),
                            )
                                .filter(([, value]) => value)
                                .map(([key]) => key)}
                            onValueChange={(values) => {
                                const selectedOptions = mapToReviewOptions({
                                    // get all options and set them to false
                                    ...Object.fromEntries(
                                        Object.keys(field.value ?? {}).map(
                                            (value) => [value, false],
                                        ),
                                    ),

                                    // then, set only selected options to true
                                    ...Object.fromEntries(
                                        values.map((value) => [value, true]),
                                    ),
                                });

                                field.onChange(selectedOptions);
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
                                                        option.value as keyof CodeReviewOptions
                                                    ]
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

"use client";

import { IssueSeverityLevelBadge } from "@components/system/issue-severity-level-badge";
import { Card, CardContent, CardHeader } from "@components/ui/card";
import { FormControl } from "@components/ui/form-control";
import { Heading } from "@components/ui/heading";
import { NumberInput } from "@components/ui/number-input";
import { Controller, useFormContext } from "react-hook-form";
import { SeverityLevel } from "src/core/types";

import type { CodeReviewFormType } from "../../../_types";

const levels = [
    {
        severity: SeverityLevel.LOW,
        description: "Minor improvements and optimizations",
    },
    {
        severity: SeverityLevel.MEDIUM,
        description: "Recommended improvements for code quality",
    },
    {
        severity: SeverityLevel.HIGH,
        description: "Significant issues that need attention",
    },
    {
        severity: SeverityLevel.CRITICAL,
        description: "Issues requiring immediate attention",
    },
] as const satisfies Array<{
    severity: SeverityLevel;
    description: string;
}>;

export const SuggestionsPerSeverityLevel = () => {
    const form = useFormContext<CodeReviewFormType>();

    return (
        <div className="flex flex-col gap-2">
            <div>
                <Heading variant="h2">Suggestions per severity level</Heading>
                <span className="text-text-secondary text-sm">
                    Configure the maximum number of suggestions for each
                    severity level
                </span>
            </div>

            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {levels.map((l) => (
                    <Controller
                        key={l.severity}
                        name={`suggestionControl.severityLimits.${l.severity}.value`}
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Card className="transition-shadow hover:shadow-md">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-3">
                                        <IssueSeverityLevelBadge
                                            severity={l.severity}
                                        />
                                        <div>
                                            <Heading
                                                variant="h3"
                                                className="font-medium capitalize">
                                                {l.severity} Level
                                            </Heading>

                                            <p className="text-text-secondary text-sm">
                                                {l.description}
                                            </p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <FormControl.Root>
                                        <FormControl.Label
                                            htmlFor={field.name}
                                            className="text-sm font-medium">
                                            Maximum suggestions
                                        </FormControl.Label>

                                        <FormControl.Input>
                                            <NumberInput.Root
                                                min={0}
                                                size="md"
                                                value={field.value}
                                                disabled={field.disabled}
                                                onValueChange={field.onChange}>
                                                <NumberInput.Decrement />
                                                <NumberInput.Input
                                                    placeholder="0"
                                                    id={field.name}
                                                    error={fieldState.error}
                                                />
                                                <NumberInput.Increment />
                                            </NumberInput.Root>
                                        </FormControl.Input>
                                        <FormControl.Error>
                                            {fieldState.error?.message}
                                        </FormControl.Error>
                                        <FormControl.Helper>
                                            Enter{" "}
                                            <span className="text-primary-light">
                                                0
                                            </span>{" "}
                                            for no limit
                                        </FormControl.Helper>
                                    </FormControl.Root>
                                </CardContent>
                            </Card>
                        )}
                    />
                ))}
            </div>
        </div>
    );
};

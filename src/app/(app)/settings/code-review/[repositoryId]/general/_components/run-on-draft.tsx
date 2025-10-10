"use client";

import { Button } from "@components/ui/button";
import { CardHeader } from "@components/ui/card";
import { Heading } from "@components/ui/heading";
import { Switch } from "@components/ui/switch";
import { Controller, useFormContext } from "react-hook-form";
import { useCodeReviewConfig } from "src/app/(app)/settings/_components/context";
import { OverrideIndicatorForm } from "src/app/(app)/settings/code-review/_components/override";

import type { CodeReviewFormType } from "../../../_types";

export const RunOnDraft = () => {
    const form = useFormContext<CodeReviewFormType>();
    const config = useCodeReviewConfig();

    return (
        <Controller
            name="runOnDraft.value"
            control={form.control}
            defaultValue={config?.runOnDraft?.value}
            render={({ field }) => (
                <Button
                    size="sm"
                    variant="helper"
                    disabled={field.disabled}
                    onClick={() => field.onChange(!field.value)}
                    className="w-full">
                    <CardHeader className="flex flex-row items-center justify-between gap-6">
                        <div className="flex flex-col gap-1">
                            <div className="flex flex-row items-center gap-2">
                                <Heading variant="h3">
                                    Enable Running on Draft Pull Requests
                                </Heading>

                                <OverrideIndicatorForm fieldName="runOnDraft" />
                            </div>

                            <p className="text-text-secondary text-sm">
                                If enabled, Kody will run automated code reviews
                                on draft Pull Requests and provide feedback,
                                even if the Pull Request is not ready for
                                review.
                            </p>
                        </div>

                        <Switch decorative checked={field.value} />
                    </CardHeader>
                </Button>
            )}
        />
    );
};

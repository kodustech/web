"use client";

import { Button } from "@components/ui/button";
import { CardHeader } from "@components/ui/card";
import { Heading } from "@components/ui/heading";
import { Switch } from "@components/ui/switch";
import { Controller, useFormContext } from "react-hook-form";
import { OverrideIndicatorForm } from "src/app/(app)/settings/code-review/_components/override";

import type { CodeReviewFormType } from "../../../_types";

export const PullRequestApprovalActive = () => {
    const form = useFormContext<CodeReviewFormType>();

    return (
        <Controller
            name="pullRequestApprovalActive.value"
            control={form.control}
            render={({ field }) => (
                <Button
                    size="sm"
                    variant="helper"
                    disabled={field.disabled}
                    onClick={() => field.onChange(!field.value)}
                    className="w-full">
                    <CardHeader className="flex flex-row items-center justify-between gap-6">
                        <div className="flex flex-col gap-1">
                            <Heading variant="h3">
                                Enable Pull Request Approval
                            </Heading>

                            <OverrideIndicatorForm fieldName="pullRequestApprovalActive" />

                            <p className="text-text-secondary text-sm">
                                When Kody completes an automated code review and
                                finds no issues, it will automatically approve
                                the Pull Request.
                            </p>
                        </div>

                        <Switch decorative checked={field.value} />
                    </CardHeader>
                </Button>
            )}
        />
    );
};

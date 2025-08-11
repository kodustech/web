"use client";

import { Button } from "@components/ui/button";
import { CardHeader } from "@components/ui/card";
import { Heading } from "@components/ui/heading";
import { Switch } from "@components/ui/switch";
import { Controller, useFormContext } from "react-hook-form";

import type { CodeReviewFormType } from "../../../_types";

export const PullRequestApprovalActive = () => {
    const form = useFormContext<CodeReviewFormType>();

    return (
        <Controller
            name="pullRequestApprovalActive"
            control={form.control}
            render={({ field }) => (
                <Button
                    size="sm"
                    variant="helper"
                    onClick={() => field.onChange(!field.value)}
                    className="w-full">
                    <CardHeader className="flex flex-row items-center justify-between gap-6">
                        <div className="flex flex-col gap-1">
                            <Heading variant="h3">
                                Enable Pull Request Approval
                            </Heading>

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

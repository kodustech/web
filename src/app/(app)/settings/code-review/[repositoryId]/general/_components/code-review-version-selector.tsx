"use client";

import { Button } from "@components/ui/button";
import { CardHeader } from "@components/ui/card";
import { Heading } from "@components/ui/heading";
import { Switch } from "@components/ui/switch";
import { Controller, useFormContext } from "react-hook-form";

import type { CodeReviewFormType } from "../../../_types";
import {
    useCodeReviewConfig,
    useFullCodeReviewConfig,
} from "../../../../_components/context";

export const CodeReviewVersionSelector = () => {
    const form = useFormContext<CodeReviewFormType>();
    const config = useCodeReviewConfig();
    const fullConfig = useFullCodeReviewConfig();

    return (
        <Controller
            name="codeReviewVersion"
            control={form.control}
            defaultValue={config?.codeReviewVersion ?? "legacy"}
            render={({ field }) => {
                const shouldHideToggle =
                    fullConfig?.showToggleCodeReviewVersion === false &&
                    config?.codeReviewVersion === "v2";

                if (shouldHideToggle) {
                    return <></>;
                }

                return (
                    <Button
                        size="sm"
                        variant="helper"
                        onClick={() =>
                            field.onChange(
                                field.value === "legacy" ? "v2" : "legacy",
                            )
                        }
                        disabled={field.disabled}
                        className="w-full">
                        <CardHeader className="flex flex-row items-center justify-between gap-6">
                            <div className="flex flex-col gap-1">
                                <Heading variant="h3">
                                    Enable New Review Engine
                                </Heading>

                                <p className="text-text-secondary text-sm">
                                    When enabled, reviews highlight only
                                    objective issues (bugs, security,
                                    performance, breaking changes, cross-file).
                                    Everything else is handled by Kody Rules,
                                    cutting noise and subjectivity.
                                </p>
                            </div>

                            <Switch decorative checked={field.value === "v2"} />
                        </CardHeader>
                    </Button>
                );
            }}
        />
    );
};

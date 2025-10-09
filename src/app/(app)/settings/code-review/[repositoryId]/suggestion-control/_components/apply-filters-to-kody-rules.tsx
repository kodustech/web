import { Button } from "@components/ui/button";
import { CardHeader } from "@components/ui/card";
import { Heading } from "@components/ui/heading";
import { Switch } from "@components/ui/switch";
import { Controller, useFormContext } from "react-hook-form";

import { OverrideIndicatorForm } from "../../../_components/override";
import type { CodeReviewFormType } from "../../../_types";

export const ApplyFiltersToKodyRules = () => {
    const form = useFormContext<CodeReviewFormType>();

    return (
        <Controller
            name="suggestionControl.applyFiltersToKodyRules.value"
            control={form.control}
            render={({ field }) => (
                <Button
                    size="lg"
                    variant="helper"
                    className="w-full p-0"
                    disabled={field.disabled}
                    onClick={() => field.onChange(!field.value)}>
                    <CardHeader className="flex-row items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <div className="flex flex-row items-center gap-2">
                                <Heading variant="h3">
                                    Apply filters to Kody Rules
                                </Heading>

                                <OverrideIndicatorForm fieldName="suggestionControl.applyFiltersToKodyRules" />
                            </div>

                            <p className="text-text-secondary text-sm">
                                When OFF, Kody Rules suggestions bypass the
                                limit and severity filters.
                            </p>
                        </div>

                        <Switch size="md" decorative checked={field.value} />
                    </CardHeader>
                </Button>
            )}
        />
    );
};

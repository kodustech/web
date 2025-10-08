import { Button } from "@components/ui/button";
import { CardHeader } from "@components/ui/card";
import { Switch } from "@components/ui/switch";
import { Controller, useFormContext } from "react-hook-form";

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
                        <div>
                            <span className="text-text-primary text-base font-semibold">
                                Apply filters to Kody Rules
                            </span>
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

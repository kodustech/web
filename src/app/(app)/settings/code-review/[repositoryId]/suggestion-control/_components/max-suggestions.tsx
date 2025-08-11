import { FormControl } from "@components/ui/form-control";
import { NumberInput } from "@components/ui/number-input";
import { Controller, useFormContext } from "react-hook-form";

import { useAutomationCodeReviewConfig } from "../../../_components/context";
import { LimitationType, type CodeReviewFormType } from "../../../_types";

const MAX_SUGGESTIONS_FOR_FILE_LIMITATION_TYPE = 20;

const validateNumberInput = (value: string) => {
    const numValue = parseInt(value.replace(/^0+/, ""));
    return isNaN(numValue) ? 0 : numValue;
};

export const MaxSuggestions = () => {
    const form = useFormContext<CodeReviewFormType>();
    const config = useAutomationCodeReviewConfig();
    const limitationType = form.watch("suggestionControl.limitationType");

    const MIN_SUGGESTIONS_FOR_PR_LIMITATION_TYPE =
        Object.values(config?.reviewOptions ?? {}).filter((option) => option)
            .length * 1;

    const MIN_SUGGESTIONS =
        limitationType === LimitationType.PR
            ? MIN_SUGGESTIONS_FOR_PR_LIMITATION_TYPE
            : 0;
    const MAX_SUGGESTIONS =
        limitationType === LimitationType.FILE
            ? MAX_SUGGESTIONS_FOR_FILE_LIMITATION_TYPE
            : undefined;

    return (
        <Controller
            name="suggestionControl.maxSuggestions"
            control={form.control}
            rules={{
                validate: (value) => {
                    if (value === 0) return;

                    if (
                        form.getValues("suggestionControl.limitationType") ===
                        "file"
                    ) {
                        if (value <= MAX_SUGGESTIONS_FOR_FILE_LIMITATION_TYPE)
                            return;

                        return `Maximum limit is ${MAX_SUGGESTIONS_FOR_FILE_LIMITATION_TYPE}`;
                    }

                    if (
                        form.getValues("suggestionControl.limitationType") ===
                        "pr"
                    ) {
                        if (value >= MIN_SUGGESTIONS_FOR_PR_LIMITATION_TYPE)
                            return;

                        return `The configured limit is too low. Please increase it to at least ${MIN_SUGGESTIONS_FOR_PR_LIMITATION_TYPE} based on the selected categories.`;
                    }
                },
            }}
            render={({ field, fieldState }) => (
                <FormControl.Root>
                    <FormControl.Label htmlFor={field.name}>
                        Maximum number of suggestions
                    </FormControl.Label>

                    <FormControl.Input>
                        <NumberInput.Root
                            min={0}
                            size="md"
                            className="w-60"
                            value={field.value}
                            max={MAX_SUGGESTIONS}
                            disabled={field.disabled}
                            onValueChange={field.onChange}>
                            <NumberInput.Decrement />
                            <NumberInput.Input
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
                        Enter a number, or leave it as 0 for no limit{" "}
                        {limitationType === "file"
                            ? `(no min, max: ${MAX_SUGGESTIONS})`
                            : `(min: ${MIN_SUGGESTIONS}, no max)`}
                    </FormControl.Helper>
                </FormControl.Root>
            )}
        />
    );
};

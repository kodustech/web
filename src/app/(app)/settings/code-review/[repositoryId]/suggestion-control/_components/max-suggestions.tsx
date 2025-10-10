import { FormControl } from "@components/ui/form-control";
import { NumberInput } from "@components/ui/number-input";
import { Controller, useFormContext } from "react-hook-form";

import { OverrideIndicatorForm } from "../../../_components/override";
import { LimitationType, type CodeReviewFormType } from "../../../_types";
import { useCodeReviewConfig } from "../../../../_components/context";

const MAX_SUGGESTIONS_FOR_FILE_LIMITATION_TYPE = 20;

const validateNumberInput = (value: string) => {
    const numValue = parseInt(value.replace(/^0+/, ""));
    return isNaN(numValue) ? 0 : numValue;
};

export const MaxSuggestions = () => {
    const form = useFormContext<CodeReviewFormType>();
    const config = useCodeReviewConfig();
    const limitationType = form.watch("suggestionControl.limitationType.value");

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
            name="suggestionControl.maxSuggestions.value"
            control={form.control}
            rules={{
                validate: (value) => {
                    const limitationType = form.getValues(
                        "suggestionControl.limitationType.value",
                    );

                    if (limitationType === "file") {
                        if (value! <= MAX_SUGGESTIONS_FOR_FILE_LIMITATION_TYPE)
                            return;

                        return `Maximum limit is ${MAX_SUGGESTIONS_FOR_FILE_LIMITATION_TYPE}`;
                    }
                },
            }}
            render={({ field, fieldState }) => (
                <FormControl.Root>
                    <div className="mb-2 flex flex-row items-center gap-2">
                        <FormControl.Label htmlFor={field.name}>
                            Maximum number of suggestions
                        </FormControl.Label>

                        <OverrideIndicatorForm
                            fieldName="suggestionControl.maxSuggestions"
                            className="mb-2"
                        />
                    </div>

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

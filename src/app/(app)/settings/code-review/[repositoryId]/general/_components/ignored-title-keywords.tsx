import { FormControl } from "@components/ui/form-control";
import TagInput from "@components/ui/tag-input";
import { Controller, useFormContext } from "react-hook-form";
import { OverrideIndicatorForm } from "src/app/(app)/settings/code-review/_components/override";

import type { CodeReviewFormType } from "../../../_types";

export const IgnoredTitleKeywords = () => {
    const form = useFormContext<CodeReviewFormType>();

    return (
        <Controller
            name="ignoredTitleKeywords.value"
            control={form.control}
            render={({ field }) => (
                <FormControl.Root>
                    <FormControl.Label htmlFor={field.name}>
                        Ignore title keywords
                    </FormControl.Label>

                    <OverrideIndicatorForm fieldName="ignoredTitleKeywords" />

                    <FormControl.Input>
                        <TagInput
                            id={field.name}
                            disabled={field.disabled}
                            tags={field.value}
                            placeholder="Press Enter to add a title"
                            onTagsChange={field.onChange}
                        />
                    </FormControl.Input>

                    <FormControl.Helper>
                        Ignore the review if the pull request title contains any
                        of these keywords (case-insensitive). 100 characters
                        maximum per keyword.
                    </FormControl.Helper>
                </FormControl.Root>
            )}
        />
    );
};

import { FormControl } from "@components/ui/form-control";
import TagInput from "@components/ui/tag-input";
import { Controller, useFormContext } from "react-hook-form";

import type { CodeReviewFormType } from "../../../_types";

export const BaseBranches = () => {
    const form = useFormContext<CodeReviewFormType>();

    return (
        <Controller
            name="baseBranches"
            control={form.control}
            render={({ field }) => (
                <FormControl.Root>
                    <FormControl.Label htmlFor={field.name}>
                        Base Branches
                    </FormControl.Label>

                    <FormControl.Input>
                        <TagInput
                            id={field.name}
                            disabled={field.disabled}
                            tags={field.value}
                            placeholder="Press Enter to add a branch"
                            onTagsChange={field.onChange}
                        />
                    </FormControl.Input>

                    <FormControl.Helper>
                        Base branches (besides the default branch) to review.
                        Examples: "dev, release, master". 100 characters maximum
                        per branch.
                    </FormControl.Helper>
                </FormControl.Root>
            )}
        />
    );
};

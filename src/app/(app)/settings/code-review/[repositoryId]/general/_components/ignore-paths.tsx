import { FormControl } from "@components/ui/form-control";
import { Textarea } from "@components/ui/textarea";
import { Controller, useFormContext } from "react-hook-form";

import type { CodeReviewFormType } from "../../../_types";

export const IgnorePaths = () => {
    const form = useFormContext<CodeReviewFormType>();

    return (
        <Controller
            name="ignorePaths"
            control={form.control}
            render={({ field }) => (
                <FormControl.Root>
                    <FormControl.Label htmlFor={field.name}>
                        Ignored files
                    </FormControl.Label>

                    <FormControl.Input>
                        <Textarea
                            id={field.name}
                            disabled={field.disabled}
                            defaultValue={field.value?.join("\n")}
                            onChange={(ev) => {
                                const text = ev.target.value;
                                const ignorePaths = text
                                    .split("\n")
                                    .map((item) => item.trim())
                                    .filter((item) => item !== "");

                                field.onChange(ignorePaths);
                            }}
                            placeholder={`List the files to be ignored here, one per line. Example:\n\nyarn.lock\npackage-lock.json\npackage.json\n.env`}
                            maxLength={1000}
                            className="min-h-40"
                        />
                    </FormControl.Input>

                    <FormControl.Helper>
                        Glob pattern for file path. One per line. Example:
                        **/*.js
                    </FormControl.Helper>
                </FormControl.Root>
            )}
        />
    );
};

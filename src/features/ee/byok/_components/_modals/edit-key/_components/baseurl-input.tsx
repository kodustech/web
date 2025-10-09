import { FormControl } from "@components/ui/form-control";
import { Textarea } from "@components/ui/textarea";
import { useSuspenseGetLLMProviders } from "@services/organizationParameters/hooks";
import { Controller, useFormContext } from "react-hook-form";

import type { EditKeyForm } from "../_types";

export const ByokBaseURLInput = () => {
    const form = useFormContext<EditKeyForm>();
    const { providers } = useSuspenseGetLLMProviders();

    const provider = form.watch("provider");
    const foundProvider = providers.find((p) => p.id === provider);
    if (!foundProvider?.requiresBaseUrl) return null;

    return (
        <Controller
            name="baseURL"
            control={form.control}
            render={({ field, fieldState }) => (
                <FormControl.Root>
                    <FormControl.Label htmlFor={field.name}>
                        Base URL
                    </FormControl.Label>

                    <FormControl.Input>
                        <Textarea
                            id={field.name}
                            value={field.value ?? ""}
                            error={fieldState.error}
                            onChange={field.onChange}
                            className="max-h-26 min-h-20"
                            placeholder="Provide your base URL"
                        />
                    </FormControl.Input>

                    <FormControl.Error>
                        {fieldState.error?.message}
                    </FormControl.Error>
                </FormControl.Root>
            )}
        />
    );
};

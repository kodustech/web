import { FormControl } from "@components/ui/form-control";
import { Textarea } from "@components/ui/textarea";
import { useSuspenseGetLLMProviders } from "@services/organizationParameters/hooks";
import { Controller, useFormContext } from "react-hook-form";

import type { EditKeyForm } from "../_types";

export const ByokKeyInput = () => {
    const form = useFormContext<EditKeyForm>();
    const { providers } = useSuspenseGetLLMProviders();

    const provider = form.watch("provider");
    const foundProvider = providers.find((p) => p.id === provider);
    if (!foundProvider?.requiresApiKey) return null;

    return (
        <Controller
            name="apiKey"
            control={form.control}
            render={({ field }) => (
                <FormControl.Root>
                    <FormControl.Label htmlFor={field.name}>
                        Key
                    </FormControl.Label>

                    <FormControl.Input>
                        <Textarea
                            id={field.name}
                            value={field.value}
                            onChange={field.onChange}
                            className="max-h-56 min-h-32"
                            placeholder="Provide your key"
                        />
                    </FormControl.Input>
                </FormControl.Root>
            )}
        />
    );
};

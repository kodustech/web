"use client";

import { useState } from "react";
import { Button } from "@components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandInput,
    CommandItem,
    CommandList,
} from "@components/ui/command";
import { FormControl } from "@components/ui/form-control";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@components/ui/popover";
import { useSuspenseGetLLMProviders } from "@services/organizationParameters/hooks";
import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { ChevronsUpDownIcon } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";
import { ArrayHelpers } from "src/core/utils/array";

import type { EditKeyForm } from "../_types";

export const ByokProviderSelect = () => {
    const form = useFormContext<EditKeyForm>();
    const [open, setOpen] = useState(false);
    const { providers } = useSuspenseGetLLMProviders();
    const { reset: resetErrorBoundary } = useQueryErrorResetBoundary();

    return (
        <Popover modal open={open} onOpenChange={setOpen}>
            <Controller
                name="provider"
                control={form.control}
                render={({ field }) => (
                    <FormControl.Root>
                        <FormControl.Label htmlFor={field.name}>
                            Provider
                        </FormControl.Label>

                        <FormControl.Input>
                            <PopoverTrigger asChild>
                                <Button
                                    size="md"
                                    variant="helper"
                                    role="combobox"
                                    id={field.name}
                                    className="w-full justify-between"
                                    rightIcon={
                                        <ChevronsUpDownIcon className="-mr-2 opacity-50" />
                                    }>
                                    {providers.find((p) => p.id === field.value)
                                        ?.name ?? (
                                        <span className="font-normal">
                                            Select a provider
                                        </span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                        </FormControl.Input>
                    </FormControl.Root>
                )}
            />

            <PopoverContent
                align="start"
                className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command
                    filter={(value, search) => {
                        const repository = providers.find(
                            (r) => r.id === value,
                        );

                        if (!repository) return 0;

                        if (
                            repository.name
                                .toLowerCase()
                                .includes(search.toLowerCase())
                        ) {
                            return 1;
                        }

                        return 0;
                    }}>
                    <CommandInput placeholder="Search providers..." />

                    <CommandList className="max-h-56 overflow-y-auto p-1">
                        <CommandEmpty>No model found.</CommandEmpty>

                        {ArrayHelpers.sortAlphabetically(providers, "name").map(
                            (r) => (
                                <CommandItem
                                    key={r.id}
                                    value={r.id}
                                    onSelect={(v) => {
                                        form.reset({
                                            model: "",
                                            apiKey: "",
                                            provider: v,
                                            baseURL: r.requiresBaseUrl
                                                ? ""
                                                : null,
                                        });

                                        if (r.requiresBaseUrl) {
                                            form.trigger("baseURL");
                                        }

                                        resetErrorBoundary();
                                        setOpen(false);
                                    }}>
                                    {r.name}
                                </CommandItem>
                            ),
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

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
import { Input } from "@components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@components/ui/popover";
import {
    useSuspenseGetLLMProviderModels,
    useSuspenseGetLLMProviders,
} from "@services/organizationParameters/hooks";
import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { ChevronsUpDownIcon } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";
import { ArrayHelpers } from "src/core/utils/array";

import type { EditKeyForm } from "../_types";

export const ByokModelSelect = () => {
    const form = useFormContext<EditKeyForm>();
    const provider = form.watch("provider");
    const { providers } = useSuspenseGetLLMProviders();
    const foundProvider = providers.find((p) => p.id === provider);

    return foundProvider?.requiresBaseUrl ? <ModelInput /> : <ModelSelect />;
};

const ModelInput = () => {
    const form = useFormContext<EditKeyForm>();
    const provider = form.watch("provider");
    const baseURL = form.watch("baseURL");

    return (
        <Controller
            name="model"
            control={form.control}
            render={({ field }) => (
                <FormControl.Root>
                    <FormControl.Label htmlFor={field.name}>
                        Model
                    </FormControl.Label>

                    <FormControl.Input>
                        <Input
                            {...field}
                            size="md"
                            id={field.name}
                            className="w-full justify-between"
                            placeholder="Type a model name"
                            onChange={(ev) => {
                                form.reset({
                                    model: ev.target.value,
                                    provider,
                                    apiKey: "",
                                    baseURL: baseURL,
                                });
                            }}
                        />
                    </FormControl.Input>
                </FormControl.Root>
            )}
        />
    );
};

const ModelSelect = () => {
    const form = useFormContext<EditKeyForm>();
    const [open, setOpen] = useState(false);
    const provider = form.watch("provider");
    const { models } = useSuspenseGetLLMProviderModels({ provider });
    const { reset: resetErrorBoundary } = useQueryErrorResetBoundary();

    const { providers } = useSuspenseGetLLMProviders();
    const foundProvider = providers.find((p) => p.id === provider);

    return (
        <Popover modal open={open} onOpenChange={setOpen}>
            <Controller
                name="model"
                control={form.control}
                render={({ field }) => (
                    <FormControl.Root>
                        <FormControl.Label htmlFor={field.name}>
                            Model
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
                                    {models.find((p) => p.id === field.value)
                                        ?.name ?? (
                                        <span className="font-normal">
                                            Select a model
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
                        const repository = models.find((r) => r.id === value);

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
                    <CommandInput placeholder="Search models..." />

                    <CommandList className="max-h-56 overflow-y-auto p-1">
                        <CommandEmpty>No model found.</CommandEmpty>

                        {ArrayHelpers.sortAlphabetically(models, "name").map(
                            (r) => (
                                <CommandItem
                                    key={r.id}
                                    value={r.id}
                                    onSelect={(v) => {
                                        form.reset({
                                            model: v,
                                            provider,
                                            apiKey: "",
                                            baseURL: null,
                                        });

                                        resetErrorBoundary();
                                        setOpen(false);
                                    }}>
                                    <span>{r.name}</span>
                                </CommandItem>
                            ),
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

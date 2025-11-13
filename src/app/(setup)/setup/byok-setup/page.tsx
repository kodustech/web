"use client";

import { Suspense, useState } from "react";
import { redirect, useRouter } from "next/navigation";
import { Button } from "@components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@components/ui/card";
import {
    Command,
    CommandEmpty,
    CommandInput,
    CommandItem,
    CommandList,
} from "@components/ui/command";
import { FormControl } from "@components/ui/form-control";
import { Heading } from "@components/ui/heading";
import { SvgKodus } from "@components/ui/icons/SvgKodus";
import { Input } from "@components/ui/input";
import { Page } from "@components/ui/page";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@components/ui/popover";
import { toast } from "@components/ui/toaster/use-toast";
import { createOrUpdateOrganizationParameter } from "@services/organizationParameters/fetch";
import {
    useSuspenseGetLLMProviderModels,
    useSuspenseGetLLMProviders,
} from "@services/organizationParameters/hooks";
import { useSuspenseGetParameterPlatformConfigs } from "@services/parameters/hooks";
import { OrganizationParametersConfigKey } from "@services/parameters/types";
import { ChevronsUpDownIcon } from "lucide-react";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";
import { ArrayHelpers } from "src/core/utils/array";
import { cn } from "src/core/utils/components";
import type { BYOKConfig } from "src/features/ee/byok/_types";
import { useOrganizationContext } from "src/features/organization/_providers/organization-context";

import { StepIndicators } from "../_components/step-indicators";

const ProviderSelect = ({
    providers,
    provider,
    onProviderChange,
}: {
    providers: Array<{ id: string; name: string }>;
    provider: string;
    onProviderChange: (value: string) => void;
}) => {
    const [open, setOpen] = useState(false);

    const selectedProvider = providers.find((p) => p.id === provider);

    return (
        <Popover modal open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    size="lg"
                    variant="helper"
                    role="combobox"
                    className="w-full justify-between"
                    rightIcon={
                        <ChevronsUpDownIcon className="-mr-2 opacity-50" />
                    }>
                    {selectedProvider?.name ?? (
                        <span className="font-normal">Select a provider</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                align="start"
                className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command
                    filter={(value, search) => {
                        const foundProvider = providers.find(
                            (p) => p.id === value,
                        );

                        if (!foundProvider) return 0;

                        if (
                            foundProvider.name
                                .toLowerCase()
                                .includes(search.toLowerCase())
                        ) {
                            return 1;
                        }

                        return 0;
                    }}>
                    <CommandInput placeholder="Search providers..." />

                    <CommandList className="max-h-56 overflow-y-auto p-1">
                        <CommandEmpty>No provider found.</CommandEmpty>

                        {ArrayHelpers.sortAlphabetically(providers, "name").map(
                            (p) => (
                                <CommandItem
                                    key={p.id}
                                    value={p.id}
                                    onSelect={(v) => {
                                        onProviderChange(v);
                                        setOpen(false);
                                    }}>
                                    {p.name}
                                </CommandItem>
                            ),
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

const ModelSelectContent = ({
    provider,
    model,
    onModelChange,
}: {
    provider: string;
    model: string;
    onModelChange: (value: string) => void;
}) => {
    const { models } = useSuspenseGetLLMProviderModels({ provider });
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    const selectedModel = models.find((m) => m.id === model);

    return (
        <>
            <FormControl.Input>
                <Popover modal open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            size="lg"
                            variant="helper"
                            role="combobox"
                            className="w-full justify-between"
                            rightIcon={
                                <ChevronsUpDownIcon className="-mr-2 opacity-50" />
                            }>
                            {selectedModel?.name ?? (
                                <span className="font-normal">
                                    Select a model
                                </span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        align="start"
                        className="w-[var(--radix-popover-trigger-width)] p-0">
                        <Command
                            filter={(value, searchTerm) => {
                                const foundModel = models.find(
                                    (m) => m.id === value,
                                );

                                if (!foundModel) return 0;

                                if (
                                    foundModel.name
                                        .toLowerCase()
                                        .includes(searchTerm.toLowerCase())
                                ) {
                                    return 1;
                                }

                                return 0;
                            }}>
                            <CommandInput
                                placeholder="Search models..."
                                value={search}
                                onValueChange={setSearch}
                            />

                            <CommandList className="max-h-56 overflow-y-auto p-1">
                                <CommandEmpty>No model found.</CommandEmpty>

                                {ArrayHelpers.sortAlphabetically(
                                    models,
                                    "name",
                                ).map((m) => (
                                    <CommandItem
                                        key={m.id}
                                        value={m.id}
                                        onSelect={(v) => {
                                            onModelChange(v);
                                            setOpen(false);
                                        }}>
                                        {m.name}
                                    </CommandItem>
                                ))}
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </FormControl.Input>
            <FormControl.Helper>
                Or type model name manually below
            </FormControl.Helper>
            <div className="mt-2">
                <FormControl.Input>
                    <Input
                        value={model}
                        placeholder="Type model name manually"
                        onChange={(e) => onModelChange(e.target.value)}
                    />
                </FormControl.Input>
            </div>
        </>
    );
};

const ModelSelect = ({
    provider,
    model,
    onModelChange,
}: {
    provider: string;
    model: string;
    onModelChange: (value: string) => void;
}) => {
    return (
        <FormControl.Root>
            <FormControl.Label>Model</FormControl.Label>
            <Suspense
                fallback={
                    <FormControl.Input>
                        <Input
                            value={model}
                            placeholder="Loading models..."
                            disabled
                        />
                    </FormControl.Input>
                }>
                <ModelSelectContent
                    provider={provider}
                    model={model}
                    onModelChange={onModelChange}
                />
            </Suspense>
        </FormControl.Root>
    );
};

export default function BYOKSetupPage() {
    const router = useRouter();
    const { organizationId } = useOrganizationContext();
    const { providers } = useSuspenseGetLLMProviders();
    const [isManagedByKodus, setIsManagedByKodus] = useState(true);
    const [provider, setProvider] = useState<string>("");
    const [model, setModel] = useState("");
    const [apiKey, setApiKey] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const { teamId } = useSelectedTeamId();

    const { configValue } = useSuspenseGetParameterPlatformConfigs(teamId);
    if (configValue?.finishOnboard) redirect("/");

    const buttonText = isManagedByKodus
        ? "Continue with Managed"
        : "Continue with BYOK";

    const handleContinue = async () => {
        setIsSaving(true);
        try {
            if (!isManagedByKodus) {
                if (!provider || !model || !apiKey) {
                    toast({
                        variant: "danger",
                        title: "Please fill in all fields",
                    });
                    setIsSaving(false);
                    return;
                }

                const config: BYOKConfig = {
                    provider,
                    model,
                    apiKey,
                };

                await createOrUpdateOrganizationParameter(
                    OrganizationParametersConfigKey.BYOK_CONFIG,
                    {
                        main: config,
                    },
                    organizationId,
                );

                toast({
                    variant: "success",
                    title: "BYOK configuration saved",
                });
            }
        } catch {
            toast({
                variant: "danger",
                title: "Failed to save configuration",
            });
            setIsSaving(false);
            return;
        }
        setIsSaving(false);

        router.push("/setup/choosing-a-pull-request");
    };

    return (
        <Page.Root className="mx-auto flex min-h-screen flex-col gap-10 overflow-x-hidden overflow-y-auto p-6 lg:max-h-screen lg:flex-row lg:gap-10">
            <div className="bg-card-lv1 flex w-full max-w-xl flex-col justify-center gap-10 rounded-3xl p-8 lg:max-w-none lg:flex-10 lg:p-12">
                <SvgKodus className="h-8 min-h-8" />

                <div className="flex-1 overflow-hidden rounded-3xl">
                    <video
                        loop
                        muted
                        autoPlay
                        playsInline
                        disablePictureInPicture
                        className="h-full w-full object-contain"
                        src="/assets/videos/setup/learn-with-your-context.webm"
                    />
                </div>
            </div>

            <div className="flex w-full flex-col gap-10 lg:flex-14 lg:justify-center lg:p-10">
                <div className="flex flex-col gap-10">
                    <StepIndicators.Auto />

                    <div className="flex flex-col gap-2">
                        <Heading variant="h2">
                            Choose how Kody runs your reviews
                        </Heading>
                        <p className="text-text-secondary text-sm">
                            You can switch this anytime in Settings.
                        </p>
                    </div>

                    <Card className="border-card-lv3">
                        <CardHeader className="pb-1">
                            <CardTitle>
                                You've unlocked a 14-day Teams trial!
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pb-0">
                            Choose how Kody will run your reviews: Use your own
                            API key (BYOK) or Managed by Kodus.
                        </CardContent>
                        <CardFooter>
                            <CardDescription>
                                After the trial, you can switch to the Free
                                Community plan or keep Teams. Kodus will not
                                charge you today.
                            </CardDescription>
                        </CardFooter>
                    </Card>

                    <div className="flex w-full flex-col gap-4 lg:flex-row">
                        <Card
                            className={cn(
                                "flex flex-1 cursor-pointer transition-colors",
                                !isManagedByKodus
                                    ? "border-primary-light"
                                    : "border-card-lv3",
                            )}
                            onClick={() => setIsManagedByKodus(false)}>
                            <CardHeader className="relative">
                                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="flex flex-col gap-1">
                                        <CardTitle>
                                            Use your own API key (BYOK)
                                        </CardTitle>
                                        <CardDescription>
                                            Full control over models and costs.
                                        </CardDescription>
                                    </div>
                                    {!isManagedByKodus && (
                                        <div className="bg-primary-light size-3 shrink-0 rounded-full" />
                                    )}
                                </div>
                            </CardHeader>
                        </Card>

                        <Card
                            className={cn(
                                "flex flex-1 cursor-pointer transition-colors",
                                isManagedByKodus
                                    ? "border-primary-light"
                                    : "border-card-lv3",
                            )}
                            onClick={() => setIsManagedByKodus(true)}>
                            <CardHeader className="relative">
                                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="flex flex-col gap-1">
                                        <CardTitle>Managed by Kodus</CardTitle>
                                        <CardDescription>
                                            No API keys required. Fastest setup.
                                        </CardDescription>
                                    </div>
                                    {isManagedByKodus && (
                                        <div className="bg-primary-light size-3 shrink-0 rounded-full" />
                                    )}
                                </div>
                            </CardHeader>
                        </Card>
                    </div>

                    {!isManagedByKodus && (
                        <div className="flex w-full flex-col gap-4">
                            <p className="text-text-secondary text-sm">
                                Your AI provider may charge for usage.
                            </p>
                            <FormControl.Root>
                                <FormControl.Label>Provider</FormControl.Label>
                                <FormControl.Input>
                                    <ProviderSelect
                                        providers={providers}
                                        provider={provider}
                                        onProviderChange={(value) => {
                                            setProvider(value);
                                            setModel("");
                                        }}
                                    />
                                </FormControl.Input>
                            </FormControl.Root>
                            {provider && (
                                <ModelSelect
                                    provider={provider}
                                    model={model}
                                    onModelChange={setModel}
                                />
                            )}
                            <FormControl.Root>
                                <FormControl.Label>Api Key</FormControl.Label>
                                <FormControl.Input>
                                    <Input
                                        type="password"
                                        value={apiKey}
                                        onChange={(e) =>
                                            setApiKey(e.target.value)
                                        }
                                    />
                                </FormControl.Input>
                            </FormControl.Root>
                        </div>
                    )}

                    <Button
                        variant="primary"
                        size="lg"
                        className="w-full"
                        onClick={handleContinue}
                        loading={isSaving}
                        disabled={
                            !isManagedByKodus &&
                            (!provider || !model || !apiKey)
                        }>
                        {buttonText}
                    </Button>
                </div>
            </div>
        </Page.Root>
    );
}

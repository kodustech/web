"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@components/ui/command";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@components/ui/dialog";
import { FormControl } from "@components/ui/form-control";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@components/ui/popover";
import { useAsyncAction } from "@hooks/use-async-action";
import { useReactQueryInvalidateQueries } from "@hooks/use-invalidate-queries";
import { COMMUNICATION_PATHS } from "@services/communication";
import { saveChannelConfigs } from "@services/communication/fetch";
import { useSuspenseGetChannels } from "@services/communication/hooks";
import { Check, ChevronsUpDown } from "lucide-react";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";
import type { IntegrationsCommon } from "src/core/types";
import { cn } from "src/core/utils/components";

export default function Discord() {
    const router = useRouter();
    const { teamId } = useSelectedTeamId();
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const channels = useSuspenseGetChannels(teamId);
    const { removeQueries, generateQueryKey } =
        useReactQueryInvalidateQueries();

    const [selectedChannel, setSelectedChannel] = useState<
        IntegrationsCommon | undefined
    >(channels.find(({ selected }) => selected));

    const [saveChannelSelectedAndGoToNextPage, { loading: isSaving }] =
        useAsyncAction(async () => {
            await saveChannelConfigs(teamId, {
                id: selectedChannel?.id,
                name: selectedChannel?.name,
            });

            removeQueries({
                queryKey: generateQueryKey(COMMUNICATION_PATHS.GET_CHANNELS, {
                    params: { teamId: teamId },
                }),
            });

            router.replace(`/settings/integrations`);
        });

    return (
        <Dialog
            open
            onOpenChange={() => {
                router.push(`/settings/integrations`);
            }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Discord channel configuration</DialogTitle>

                    <DialogDescription>
                        Select the <strong>channel</strong> we can use to{" "}
                        <strong>send notifications</strong> and actionable
                        reminders to your team.
                    </DialogDescription>
                </DialogHeader>

                <FormControl.Root className="w-full">
                    <FormControl.Input>
                        <Popover
                            open={isPopoverOpen}
                            onOpenChange={setIsPopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    size="lg"
                                    variant="helper"
                                    role="combobox"
                                    className="w-full justify-between">
                                    {selectedChannel ? (
                                        selectedChannel.name
                                    ) : (
                                        <span className="text-text-secondary">
                                            Select channel...
                                        </span>
                                    )}
                                    <ChevronsUpDown className="size-4 opacity-50" />
                                </Button>
                            </PopoverTrigger>

                            <PopoverContent
                                align="start"
                                className="max-w-60 min-w-[var(--radix-popover-trigger-width)] p-0">
                                <Command
                                    filter={(value, search) => {
                                        const language = channels.find(
                                            (r) =>
                                                r.id.toLowerCase() ===
                                                value.toLowerCase(),
                                        );

                                        if (!language) return 0;

                                        if (
                                            language.name
                                                .toLowerCase()
                                                .includes(search.toLowerCase())
                                        ) {
                                            return 1;
                                        }

                                        return 0;
                                    }}>
                                    <CommandInput placeholder="Search channel..." />

                                    <CommandList>
                                        <CommandEmpty>
                                            No channels found
                                        </CommandEmpty>

                                        <CommandGroup>
                                            {channels.map((d) => (
                                                <CommandItem
                                                    key={d.id}
                                                    value={d.id}
                                                    onSelect={() => {
                                                        setSelectedChannel(d);
                                                        setIsPopoverOpen(false);
                                                    }}>
                                                    {d.name}
                                                    <Check
                                                        className={cn(
                                                            "text-primary-light ml-auto size-4",
                                                            selectedChannel?.id ===
                                                                d.id
                                                                ? "opacity-100"
                                                                : "opacity-0",
                                                        )}
                                                    />
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </FormControl.Input>
                </FormControl.Root>

                <DialogFooter>
                    <DialogClose>
                        <Button size="md" variant="cancel">
                            Cancel
                        </Button>
                    </DialogClose>

                    <Button
                        size="md"
                        variant="primary"
                        disabled={!selectedChannel}
                        loading={isSaving}
                        onClick={() => saveChannelSelectedAndGoToNextPage()}>
                        Select channel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

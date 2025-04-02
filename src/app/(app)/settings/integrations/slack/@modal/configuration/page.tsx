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
import { toast } from "@components/ui/toaster/use-toast";
import { useAsyncAction } from "@hooks/use-async-action";
import { useReactQueryInvalidateQueries } from "@hooks/use-invalidate-queries";
import { COMMUNICATION_PATHS } from "@services/communication";
import { saveChannelConfigs } from "@services/communication/fetch";
import { useSuspenseGetChannels } from "@services/communication/hooks";
import { Check, ChevronsUpDown } from "lucide-react";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";
import { type IntegrationsCommon } from "src/core/types";
import { cn } from "src/core/utils/components";

export default function Slack() {
    const router = useRouter();
    const { teamId } = useSelectedTeamId();
    const { generateQueryKey, removeQueries } =
        useReactQueryInvalidateQueries();

    const [isUserAwareOfPrivateChannel, setIsUserAwareOfPrivateChannel] =
        useState(false);
    const channels = useSuspenseGetChannels(teamId);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    const [selectedChannel, setSelectedChannel] = useState<
        IntegrationsCommon | undefined
    >(channels.find(({ selected }) => selected));

    const [saveChannelSelectedAndGoToNextPage, { loading: isSaving }] =
        useAsyncAction(async () => {
            const { data: botAddedToChannel } = await saveChannelConfigs(
                teamId,
                selectedChannel,
                selectedChannel?.isPrivate,
                false,
            );

            if (botAddedToChannel) {
                removeQueries({
                    queryKey: generateQueryKey(
                        COMMUNICATION_PATHS.GET_CHANNELS,
                        { params: { teamId } },
                    ),
                });

                router.replace(`/settings/integrations`);
            } else {
                setIsUserAwareOfPrivateChannel(false);
                toast({
                    description:
                        "It seems that Kody has not been added to the private channel yet, please try again.",
                    variant: "destructive",
                });
            }
        });

    return (
        <Dialog
            open
            onOpenChange={() => {
                router.push(`/settings/integrations`);
            }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Slack channel configuration</DialogTitle>

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
                                    variant="outline"
                                    role="combobox"
                                    className="h-10 justify-between">
                                    {selectedChannel ? (
                                        selectedChannel.name
                                    ) : (
                                        <span className="text-muted-foreground">
                                            Select channel...
                                        </span>
                                    )}
                                    <ChevronsUpDown className="size-4 opacity-50" />
                                </Button>
                            </PopoverTrigger>

                            <PopoverContent
                                align="start"
                                className="min-w-[var(--radix-popover-trigger-width)] max-w-60 p-0">
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
                                                        setIsUserAwareOfPrivateChannel(
                                                            false,
                                                        );
                                                        setIsPopoverOpen(false);
                                                    }}>
                                                    {d.name}
                                                    <Check
                                                        className={cn(
                                                            "ml-auto size-4 text-brand-orange",
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

                    {selectedChannel?.isPrivate &&
                        !isUserAwareOfPrivateChannel && (
                            <>
                                <FormControl.Error className="mt-2 flex flex-col gap-1">
                                    <p>
                                        Channel{" "}
                                        <strong>{selectedChannel.name}</strong>{" "}
                                        is private.
                                    </p>

                                    <p>
                                        Use the command{" "}
                                        <code className="text-white">
                                            /invite @Kody
                                        </code>{" "}
                                        to grant the bot access to the channel.
                                    </p>

                                    <p>
                                        Once you've added Kody to the channel,
                                        come back here and click in the link
                                        below to continue.
                                    </p>
                                </FormControl.Error>

                                <span className="flex items-center gap-1 text-xs">
                                    <span>Already invited Kody?</span>
                                    <Button
                                        variant="link"
                                        selected
                                        className="text-xs"
                                        onClick={() => {
                                            setIsUserAwareOfPrivateChannel(
                                                true,
                                            );
                                        }}>
                                        Click here
                                    </Button>
                                </span>
                            </>
                        )}
                </FormControl.Root>

                <DialogFooter>
                    <DialogClose>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>

                    <Button
                        disabled={
                            !selectedChannel ||
                            (selectedChannel.isPrivate &&
                                !isUserAwareOfPrivateChannel)
                        }
                        loading={isSaving}
                        onClick={() => saveChannelSelectedAndGoToNextPage()}>
                        Select channel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

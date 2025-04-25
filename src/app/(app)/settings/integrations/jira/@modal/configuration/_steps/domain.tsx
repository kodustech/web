import { useContext, useState } from "react";
import { Button } from "@components/ui/button";
import {
    Command,
    CommandGroup,
    CommandItem,
    CommandList,
} from "@components/ui/command";
import {
    DialogClose,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@components/ui/dialog";
import { FormControl } from "@components/ui/form-control";
import { useMultiStep } from "@components/ui/multi-step";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@components/ui/popover";
import { useEffectOnce } from "@hooks/use-effect-once";
import { useSuspenseGetDomains } from "@services/projectManagement/hooks";
import { ArrowRight, Check, ChevronsUpDown } from "lucide-react";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";
import { cn } from "src/core/utils/components";

import type { steps } from ".";
import { JiraSetupContext } from "../_context";

export const SelectDomainStep = () => {
    const { teamId } = useSelectedTeamId();
    const domains = useSuspenseGetDomains(teamId);
    const { domain: _domain, project, board } = useContext(JiraSetupContext);
    const multiStep = useMultiStep<keyof typeof steps>();
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    const domain = _domain.selected;
    useEffectOnce(() => {
        _domain.setSelected(domains.find(({ selected }) => selected));
    });

    return (
        <>
            <DialogHeader>
                <DialogTitle>Jira setup - select domain</DialogTitle>

                <div className="flex flex-row gap-2">
                    <div className="bg-primary-light aspect-[4] h-2 rounded-full" />
                    <div className="bg-card-lv2 aspect-[4] h-2 rounded-full" />
                    <div className="bg-card-lv2 aspect-[4] h-2 rounded-full" />
                    <div className="bg-card-lv2 aspect-[4] h-2 rounded-full" />
                </div>
            </DialogHeader>

            <FormControl.Root>
                <FormControl.Label htmlFor="select-jira-domain">
                    Select your team's Jira domain:
                </FormControl.Label>

                <FormControl.Input>
                    <Popover
                        open={isPopoverOpen}
                        onOpenChange={setIsPopoverOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                size="lg"
                                variant="helper"
                                role="combobox"
                                id="select-jira-domain"
                                className="w-full justify-between">
                                {domain ? (
                                    domain.name
                                ) : (
                                    <span className="text-text-secondary">
                                        Select domain...
                                    </span>
                                )}
                                <ChevronsUpDown className="size-4 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent
                            align="start"
                            className="max-w-60 min-w-[var(--radix-popover-trigger-width)] p-0">
                            <Command>
                                <CommandList>
                                    <CommandGroup>
                                        {domains.map((d) => (
                                            <CommandItem
                                                key={d.id}
                                                value={d.id}
                                                onSelect={(currentValue) => {
                                                    _domain.setSelected(d);
                                                    project.setSelected(
                                                        undefined,
                                                    );
                                                    board.setSelected(
                                                        undefined,
                                                    );

                                                    setIsPopoverOpen(false);
                                                }}>
                                                {d.name}
                                                <Check
                                                    className={cn(
                                                        "text-primary-light ml-auto size-4",
                                                        domain?.id === d.id
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
                    <Button variant="cancel" size="md">
                        Cancel
                    </Button>
                </DialogClose>

                <Button
                    size="md"
                    variant="primary"
                    rightIcon={<ArrowRight />}
                    disabled={!domain}
                    onClick={() => multiStep.navigateTo("project")}>
                    Next
                </Button>
            </DialogFooter>
        </>
    );
};

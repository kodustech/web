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
                    <div className="aspect-[4] h-2 rounded-full bg-brand-orange" />
                    <div className="aspect-[4] h-2 rounded-full bg-card" />
                    <div className="aspect-[4] h-2 rounded-full bg-card" />
                    <div className="aspect-[4] h-2 rounded-full bg-card" />
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
                                variant="outline"
                                role="combobox"
                                id="select-jira-domain"
                                className="h-10 justify-between">
                                {domain ? (
                                    domain.name
                                ) : (
                                    <span className="text-muted-foreground">
                                        Select domain...
                                    </span>
                                )}
                                <ChevronsUpDown className="size-4 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent
                            align="start"
                            className="min-w-[var(--radix-popover-trigger-width)] max-w-60 p-0">
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
                                                        "ml-auto size-4 text-brand-orange",
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
                    <Button variant="outline">Cancel</Button>
                </DialogClose>

                <Button
                    className="w-fit self-end"
                    rightIcon={<ArrowRight />}
                    disabled={!domain}
                    onClick={() => multiStep.navigateTo("project")}>
                    Next
                </Button>
            </DialogFooter>
        </>
    );
};

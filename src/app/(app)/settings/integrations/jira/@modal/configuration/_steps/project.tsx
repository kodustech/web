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
import { useSuspenseGetProjects } from "@services/projectManagement/hooks";
import { ArrowLeft, ArrowRight, Check, ChevronsUpDown } from "lucide-react";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";
import { cn } from "src/core/utils/components";

import type { steps } from ".";
import { JiraSetupContext } from "../_context";

export const SelectProjectStep = () => {
    const { teamId } = useSelectedTeamId();
    const { domain, project: _project, board } = useContext(JiraSetupContext);
    const projects = useSuspenseGetProjects(teamId, domain.selected);
    const multiStep = useMultiStep<keyof typeof steps>();
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    const project = _project.selected;
    useEffectOnce(() => {
        _project.setSelected(projects.find(({ selected }) => selected));
    });

    return (
        <>
            <DialogHeader>
                <div className="flex flex-row items-center gap-4">
                    <Button
                        size="icon-md"
                        variant="helper"
                        onClick={() => multiStep.back()}>
                        <ArrowLeft />
                    </Button>

                    <div className="flex flex-col gap-2">
                        <DialogTitle>Jira setup - select project</DialogTitle>

                        <div className="flex flex-row gap-2">
                            <div className="bg-card aspect-[4] h-2 rounded-full" />
                            <div className="bg-primary-light aspect-[4] h-2 rounded-full" />
                            <div className="bg-card aspect-[4] h-2 rounded-full" />
                            <div className="bg-card aspect-[4] h-2 rounded-full" />
                        </div>
                    </div>
                </div>
            </DialogHeader>

            <FormControl.Root>
                <FormControl.Label htmlFor="select-jira-project">
                    Select your team's Jira project:
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
                                id="select-jira-project"
                                className="w-full justify-between">
                                {project ? (
                                    project.name
                                ) : (
                                    <span className="text-text-secondary">
                                        Select project...
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
                                        {projects.map((d) => (
                                            <CommandItem
                                                key={d.id}
                                                value={d.id}
                                                onSelect={() => {
                                                    _project.setSelected(d);
                                                    board.setSelected(
                                                        undefined,
                                                    );
                                                    setIsPopoverOpen(false);
                                                }}>
                                                {d.name}
                                                <Check
                                                    className={cn(
                                                        "text-primary-light ml-auto size-4",
                                                        project?.id === d.id
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
                    disabled={!project}
                    onClick={() => multiStep.navigateTo("board")}>
                    Next
                </Button>
            </DialogFooter>
        </>
    );
};

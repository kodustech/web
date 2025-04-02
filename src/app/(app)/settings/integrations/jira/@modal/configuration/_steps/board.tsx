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
import { useSuspenseGetBoards } from "@services/projectManagement/hooks";
import { ArrowLeft, ArrowRight, Check, ChevronsUpDown } from "lucide-react";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";
import { cn } from "src/core/utils/components";

import type { steps } from ".";
import { JiraSetupContext } from "../_context";

export const SelectBoardStep = () => {
    const { teamId } = useSelectedTeamId();
    const multiStep = useMultiStep<keyof typeof steps>();
    const {
        domain,
        project,
        board: _board,
        isSaving,
    } = useContext(JiraSetupContext);
    const boards = useSuspenseGetBoards(
        teamId,
        domain.selected,
        project.selected,
    );

    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    const board = _board.selected;
    useEffectOnce(() => {
        _board.setSelected(boards.find(({ selected }) => selected));
    });

    return (
        <>
            <DialogHeader>
                <div className="flex flex-row items-center gap-2">
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => multiStep.back()}>
                        <ArrowLeft />
                    </Button>

                    <div className="flex flex-col gap-2">
                        <DialogTitle>Jira setup - select board</DialogTitle>

                        <div className="flex flex-row gap-2">
                            <div className="aspect-[4] h-2 rounded-full bg-card" />
                            <div className="aspect-[4] h-2 rounded-full bg-card" />
                            <div className="aspect-[4] h-2 rounded-full bg-brand-orange" />
                            <div className="aspect-[4] h-2 rounded-full bg-card" />
                        </div>
                    </div>
                </div>
            </DialogHeader>

            <FormControl.Root>
                <FormControl.Label htmlFor="select-jira-board">
                    Select your team's Jira board:
                </FormControl.Label>

                <FormControl.Input>
                    <Popover
                        open={isPopoverOpen}
                        onOpenChange={setIsPopoverOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                id="select-jira-board"
                                className="h-10 justify-between">
                                {board ? (
                                    board.name
                                ) : (
                                    <span className="text-muted-foreground">
                                        Select board...
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
                                        {boards.map((d) => (
                                            <CommandItem
                                                key={d.id}
                                                value={d.id}
                                                onSelect={() => {
                                                    _board.setSelected(d);
                                                    setIsPopoverOpen(false);
                                                }}>
                                                {d.name}
                                                <Check
                                                    className={cn(
                                                        "ml-auto size-4 text-brand-orange",
                                                        board?.id === d.id
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
                    disabled={!board}
                    loading={isSaving}
                    onClick={() => multiStep.finish()}>
                    Next
                </Button>
            </DialogFooter>
        </>
    );
};

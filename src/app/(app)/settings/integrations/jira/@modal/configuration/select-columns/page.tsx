"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@components/ui/accordion";
import { Badge } from "@components/ui/badge";
import { Button, buttonVariants } from "@components/ui/button";
import { Card, CardContent, CardHeader } from "@components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@components/ui/dialog";
import HelpVideoPopup from "@components/ui/helpVideoPopup";
import { Separator } from "@components/ui/separator";
import { useReactQueryInvalidateQueries } from "@hooks/use-invalidate-queries";
import { PROJECT_MANAGEMENT_API_PATHS } from "@services/projectManagement";
import { createOrUpdateColumnsBoardProjectManagement } from "@services/projectManagement/fetch";
import { useSuspenseGetColumns } from "@services/projectManagement/hooks";
import { IColumns } from "@services/setup/types";
import { Save } from "lucide-react";
import { ReactSortable } from "react-sortablejs";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";
import { cn } from "src/core/utils/components";

const DRAGGABLE_ITEMS_CLASSNAMES = cn(
    "[&.sortable-chosen]:cursor-grab [&.sortable-ghost]:opacity-50 text-[13px]!",
);

export default function BoardColumns() {
    const { teamId } = useSelectedTeamId();
    const router = useRouter();
    const columnsJira = useSuspenseGetColumns(teamId);
    const { removeQueries, generateQueryKey } =
        useReactQueryInvalidateQueries();

    const [disabled, setDisabled] = React.useState<boolean>(false);
    const [saveLoading, setSaveLoading] = React.useState<boolean>(false);

    const [columnsDefault, setColumnsDefault] = React.useState<IColumns[]>(
        columnsJira.columns.filter(
            (c) =>
                c.column !== "todo" &&
                c.column !== "done" &&
                c.column !== "wip",
        ),
    );

    const [todo, setTodo] = React.useState<IColumns[]>(
        columnsJira.columns.filter((c) => c.column === "todo"),
    );
    const [wip, setWip] = React.useState<IColumns[]>(
        columnsJira.columns.filter((c) => c.column === "wip"),
    );
    const [done, setDone] = React.useState<IColumns[]>(
        columnsJira.columns.filter((c) => c.column === "done"),
    );

    const [todoFormatted, wipFormatted, doneFormatted] = [
        formattedColumnsToSave("todo", todo),
        formattedColumnsToSave("wip", wip),
        formattedColumnsToSave("done", done),
    ];

    function formattedColumnsToSave(
        key: "todo" | "wip" | "done",
        columns: { name: string; id: string; order?: number }[],
    ) {
        return columns.map((column) => {
            return {
                name: column.name,
                id: column.id,
                column: key,
                order: column.order,
            };
        });
    }

    async function createOrUpdateColumns() {
        setSaveLoading(true);

        const columnsToFetch = [
            ...todoFormatted,
            ...wipFormatted,
            ...doneFormatted,
        ];

        setDisabled(true);

        await createOrUpdateColumnsBoardProjectManagement(
            columnsToFetch,
            teamId,
        );
        setSaveLoading(false);

        removeQueries({
            queryKey: generateQueryKey(
                PROJECT_MANAGEMENT_API_PATHS.PROJECT_MANAGEMENT_DOMAINS,
            ),
        });
        removeQueries({
            queryKey: generateQueryKey(
                PROJECT_MANAGEMENT_API_PATHS.PROJECT_MANAGEMENT_PROJECTS,
            ),
        });
        removeQueries({
            queryKey: generateQueryKey(
                PROJECT_MANAGEMENT_API_PATHS.PROJECT_MANAGEMENT_BOARDS,
            ),
        });

        router.replace(`/settings/integrations`);
    }

    return (
        <>
            <Dialog
                open
                onOpenChange={() => router.push(`/settings/integrations`)}>
                <DialogContent className="max-w-(--breakpoint-lg)">
                    <DialogHeader>
                        <div className="flex flex-row items-center gap-2">
                            <div className="flex flex-col gap-2">
                                <DialogTitle>
                                    Jira setup - select columns
                                </DialogTitle>
                                <DialogDescription>
                                    Explain how the columns on your project
                                    board map to the workflow below to better
                                    understand your process.
                                </DialogDescription>

                                <div className="flex flex-row gap-2">
                                    <div className="aspect-[4] h-2 rounded-full bg-card" />
                                    <div className="aspect-[4] h-2 rounded-full bg-card" />
                                    <div className="aspect-[4] h-2 rounded-full bg-card" />
                                    <div className="aspect-[4] h-2 rounded-full bg-brand-orange" />
                                </div>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="-mx-6 flex flex-col gap-2 overflow-y-auto px-6">
                        <div className="flex flex-col gap-1">
                            <span className="text-sm">
                                Drag and drop statuses into the workflow below:
                            </span>
                            <ReactSortable
                                className="flex flex-wrap gap-1.5"
                                group="shared"
                                list={columnsDefault}
                                setList={setColumnsDefault}>
                                {columnsDefault.map((item) => (
                                    <div
                                        key={item.id}
                                        className={cn(
                                            DRAGGABLE_ITEMS_CLASSNAMES,
                                            buttonVariants({
                                                size: "sm",
                                                variant: "outline",
                                            }),
                                        )}>
                                        {item.name}
                                    </div>
                                ))}
                            </ReactSortable>
                        </div>

                        <div className="flex flex-row gap-2">
                            <Card className="flex-1">
                                <CardHeader className="py-4">
                                    <Badge
                                        disabled
                                        className="h-6 cursor-default! bg-[#6A57A4] px-2 text-xs opacity-100!">
                                        To do
                                    </Badge>
                                </CardHeader>

                                <Separator />

                                <CardContent className="min-h-32 pt-5">
                                    <ReactSortable
                                        id="todo"
                                        group="shared"
                                        className="flex flex-wrap gap-1.5"
                                        list={todo}
                                        setList={setTodo}>
                                        {todo.map((item) => (
                                            <div
                                                key={item.id}
                                                className={cn(
                                                    DRAGGABLE_ITEMS_CLASSNAMES,
                                                    buttonVariants({
                                                        size: "sm",
                                                        variant: "default",
                                                    }),
                                                )}>
                                                {item.name}
                                            </div>
                                        ))}
                                    </ReactSortable>
                                </CardContent>
                            </Card>

                            <Card className="flex-1">
                                <CardHeader className="py-4">
                                    <Badge
                                        disabled
                                        className="h-6 cursor-default! bg-[#1E8AFF] px-2 text-xs opacity-100!">
                                        Work in progress
                                    </Badge>
                                </CardHeader>

                                <Separator />

                                <CardContent className="min-h-32 pt-5">
                                    <ReactSortable
                                        id="wip"
                                        group="shared"
                                        className="flex flex-wrap gap-1.5"
                                        list={wip}
                                        setList={(data) => {
                                            const wipFormatted = data.map(
                                                (column, index) => {
                                                    return {
                                                        ...column,
                                                        order: index + 1,
                                                        wipName: `${index + 1}. ${column.name}`,
                                                    };
                                                },
                                            );
                                            setWip(wipFormatted);
                                        }}>
                                        {wip.map((item) => (
                                            <div
                                                key={item.id}
                                                className={cn(
                                                    DRAGGABLE_ITEMS_CLASSNAMES,
                                                    buttonVariants({
                                                        size: "sm",
                                                        variant: "default",
                                                    }),
                                                )}>
                                                {item.wipName}
                                            </div>
                                        ))}
                                    </ReactSortable>
                                </CardContent>
                            </Card>

                            <Card className="flex-1">
                                <CardHeader className="py-4">
                                    <Badge
                                        disabled
                                        className="h-6 cursor-default! bg-success px-2 text-xs opacity-100!">
                                        Done
                                    </Badge>
                                </CardHeader>

                                <Separator />

                                <CardContent className="min-h-32 pt-5">
                                    <ReactSortable
                                        id="done"
                                        group="shared"
                                        className="flex flex-wrap gap-1.5"
                                        list={done}
                                        setList={setDone}>
                                        {done.map((item) => (
                                            <div
                                                key={item.id}
                                                className={cn(
                                                    DRAGGABLE_ITEMS_CLASSNAMES,
                                                    buttonVariants({
                                                        size: "sm",
                                                        variant: "default",
                                                    }),
                                                )}>
                                                {item.name}
                                            </div>
                                        ))}
                                    </ReactSortable>
                                </CardContent>
                            </Card>
                        </div>

                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem
                                value="item-1"
                                className="rounded-2xl bg-card px-6">
                                <AccordionTrigger>
                                    How to Setup
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground">
                                    <span>
                                        The colors represent categories (
                                        <Badge
                                            disabled
                                            className="h-6 cursor-default! bg-[#9B84CD] px-2 text-xs opacity-100!">
                                            To Do
                                        </Badge>
                                        ,{" "}
                                        <Badge
                                            disabled
                                            className="h-6 cursor-default! bg-[#1E8AFF] px-2 text-xs opacity-100!">
                                            Work in progress
                                        </Badge>
                                        ,{" "}
                                        <Badge
                                            disabled
                                            className="h-6 cursor-default! bg-success px-2 text-xs opacity-100!">
                                            Done
                                        </Badge>
                                        ) configured in your project management
                                        tool.
                                    </span>

                                    <ul className="my-4 flex flex-col gap-2">
                                        <li>
                                            <Badge
                                                disabled
                                                className="h-6 cursor-default! bg-[#9B84CD] px-2 text-xs opacity-100!">
                                                To Do
                                            </Badge>
                                            : Add statuses where tasks are ready
                                            for development. (This is the column
                                            where tasks become available for the
                                            team to start working.)
                                        </li>

                                        <li>
                                            <Badge
                                                disabled
                                                className="h-6 cursor-default! bg-[#1E8AFF] px-2 text-xs opacity-100!">
                                                Work in progress
                                            </Badge>
                                            : Include all statuses that
                                            represent work actively in progress
                                            between{" "}
                                            <span className="italic">
                                                To Do
                                            </span>{" "}
                                            and{" "}
                                            <span className="italic">Done</span>
                                            . Ensure they follow the same order
                                            as in your board.
                                        </li>

                                        <li>
                                            <Badge
                                                disabled
                                                className="h-6 cursor-default! bg-success px-2 text-xs opacity-100!">
                                                Done
                                            </Badge>
                                            : The final status where tasks are
                                            considered complete.
                                        </li>
                                    </ul>

                                    <span>
                                        Make sure your statuses accurately
                                        reflect your workflow.{" "}
                                        <span className="font-semibold text-[#C1C1C1]">
                                            Incorrect configuration may lead to
                                            inaccurate metrics and insights.
                                        </span>
                                    </span>

                                    <span>
                                        Some items are pre-configured to help
                                        you get started.
                                    </span>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>

                    <DialogFooter className="items-center gap-5">
                        {(!todoFormatted.length ||
                            !wipFormatted.length ||
                            !doneFormatted.length) && (
                            <span className="text-sm text-brand-red">
                                All statuses must have at least one item.
                            </span>
                        )}

                        <Button
                            leftIcon={<Save />}
                            loading={saveLoading}
                            disabled={
                                disabled ||
                                todoFormatted.length === 0 ||
                                wipFormatted.length === 0 ||
                                doneFormatted.length === 0
                            }
                            onClick={() => createOrUpdateColumns()}>
                            Save
                        </Button>
                    </DialogFooter>

                    <HelpVideoPopup
                        videoId="v5-2X6HwEu8?si=x25KOPnKaRgm-IWn"
                        title="✋ Need help setting up your board? Check out our guide:"
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}

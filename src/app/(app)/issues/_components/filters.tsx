"use client";

import { use, useState } from "react";
import { Button } from "@components/ui/button";
import { ButtonWithFeedback } from "@components/ui/button-with-feedback";
import { Label } from "@components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@components/ui/popover";
import { Separator } from "@components/ui/separator";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@components/ui/tooltip";
import {
    CheckIcon,
    ListFilterIcon,
    SaveIcon,
    TrashIcon,
    Undo2Icon,
    XCircleIcon,
} from "lucide-react";

import {
    DEFAULT_FILTERS,
    deleteFiltersInLocalStorage,
    getFiltersInLocalStorage,
    saveFiltersToLocalStorage,
} from "../_constants";
import { FiltersContext } from "../_contexts/filters";
import { FilterItemGroup } from "./filters/group";

export const IssuesFilters = () => {
    const { filters, setFilters } = use(FiltersContext);
    const [_localStorageFilters, _setLocalStorageFilters] = useState(
        getFiltersInLocalStorage(),
    );

    return (
        <Popover modal>
            <PopoverTrigger asChild>
                <Button
                    size="xs"
                    variant="helper"
                    leftIcon={<ListFilterIcon />}>
                    Filters{" "}
                    {filters.items.length > 0 && <>({filters.items.length})</>}
                </Button>
            </PopoverTrigger>

            <PopoverContent
                align="start"
                sideOffset={10}
                className="flex w-fit min-w-88 flex-col gap-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ListFilterIcon className="size-4" />
                        <Label>Filters</Label>
                    </div>

                    <div className="flex">
                        {_localStorageFilters && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <ButtonWithFeedback
                                        size="icon-sm"
                                        variant="cancel"
                                        data-disabled={undefined}
                                        onClick={() => {
                                            deleteFiltersInLocalStorage();
                                        }}
                                        onHideFeedback={() => {
                                            _setLocalStorageFilters(undefined);
                                        }}>
                                        <ButtonWithFeedback.Feedback>
                                            <XCircleIcon className="text-danger" />
                                        </ButtonWithFeedback.Feedback>

                                        <ButtonWithFeedback.Content>
                                            <TrashIcon />
                                        </ButtonWithFeedback.Content>
                                    </ButtonWithFeedback>
                                </TooltipTrigger>

                                <TooltipContent>
                                    Delete default filters
                                </TooltipContent>
                            </Tooltip>
                        )}

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <ButtonWithFeedback
                                    size="icon-sm"
                                    variant="cancel"
                                    data-disabled={undefined}
                                    onClick={() => {
                                        saveFiltersToLocalStorage(filters);
                                    }}
                                    onHideFeedback={() => {
                                        _setLocalStorageFilters(filters);
                                    }}>
                                    <ButtonWithFeedback.Feedback>
                                        <CheckIcon className="text-success" />
                                    </ButtonWithFeedback.Feedback>

                                    <ButtonWithFeedback.Content>
                                        <SaveIcon />
                                    </ButtonWithFeedback.Content>
                                </ButtonWithFeedback>
                            </TooltipTrigger>

                            <TooltipContent>
                                Set as default filters
                            </TooltipContent>
                        </Tooltip>

                        <Separator
                            orientation="vertical"
                            className="bg-card-lv3 mx-1"
                        />

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <ButtonWithFeedback
                                    delay={800}
                                    size="icon-sm"
                                    variant="cancel"
                                    data-disabled={undefined}
                                    onClick={() => {
                                        setFilters(
                                            _localStorageFilters ??
                                                DEFAULT_FILTERS,
                                        );
                                    }}>
                                    <ButtonWithFeedback.Feedback>
                                        <CheckIcon className="text-success" />
                                    </ButtonWithFeedback.Feedback>

                                    <ButtonWithFeedback.Content>
                                        <Undo2Icon />
                                    </ButtonWithFeedback.Content>
                                </ButtonWithFeedback>
                            </TooltipTrigger>

                            <TooltipContent>
                                Reset to default filters
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </div>

                <FilterItemGroup filters={filters} setFilters={setFilters} />
            </PopoverContent>
        </Popover>
    );
};

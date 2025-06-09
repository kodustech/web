"use client";

import * as React from "react";
import { enUS } from "date-fns/locale";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "src/core/utils/components";

import { buttonVariants } from "./button";

type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}: CalendarProps) {
    return (
        <DayPicker
            locale={enUS}
            showOutsideDays={showOutsideDays}
            className={cn("py-3", className)}
            classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "flex justify-between pt-1 relative items-center",
                caption_label: "text-sm font-medium",
                nav: "gap-x-3 flex items-center",
                nav_button: cn(
                    buttonVariants({ variant: "cancel" }),
                    "size-7 p-0",
                ),
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell: "text-text-secondary w-8 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: cn(
                    "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
                    "[&:has([aria-selected].day-range-end)]:rounded-r-lg",

                    props.mode === "range"
                        ? "[&:has(>.day-range-end)]:rounded-r-lg last:[&:has([aria-selected])]:rounded-r-lg [&:has(>.day-range-start)]:rounded-l-lg first:[&:has([aria-selected])]:rounded-l-lg"
                        : "[&:has([aria-selected])]:rounded-lg",
                ),
                day: cn(
                    "size-8 p-0 font-normal rounded-lg",
                    "hover:bg-primary-light/15 [&:not([aria-selected])]:hover:text-primary-light",
                    "focus:bg-primary-light/15 [&:not([aria-selected])]:focus:text-primary-light",
                    "[&.day-range-end.day-range-start]:rounded-l-lg [&.day-range-start.day-range-end]:rounded-r-lg",
                ),
                day_range_start:
                    "day-range-start aria-selected:bg-primary-light aria-selected:text-primary-dark rounded-r-none!",
                day_range_end:
                    "day-range-end aria-selected:bg-primary-light aria-selected:text-primary-dark rounded-l-none!",
                day_selected:
                    "bg-primary-light text-primary-dark hover:bg-primary-light/75 hover:text-primary-dark focus:bg-primary-light/75 focus:text-primary-dark",
                day_today: "bg-card-lv1 text-primary-light",
                day_outside:
                    "day-outside text-text-secondary opacity-50 aria-selected:text-primary-dark aria-selected:opacity-30",
                day_disabled: "text-text-secondary opacity-50",
                day_range_middle:
                    "aria-selected:bg-primary-light aria-selected:text-primary-dark rounded-none!",
                day_hidden: "invisible",
                ...classNames,
            }}
            components={{
                IconLeft: ({ ...props }) => (
                    <ChevronLeftIcon className="h-4 w-4" />
                ),
                IconRight: ({ ...props }) => (
                    <ChevronRightIcon className="h-4 w-4" />
                ),
            }}
            {...props}
        /> 
    );
}
Calendar.displayName = "Calendar";

export { Calendar };

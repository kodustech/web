"use client";

import { enUS } from "date-fns/locale";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "src/core/utils/components";

import { buttonVariants } from "./button";

function Calendar({
    className,
    classNames,
    ...props
}: React.ComponentProps<typeof DayPicker>) {
    return (
        <DayPicker
            locale={enUS}
            showOutsideDays
            {...props}
            className={cn("py-3", className)}
            classNames={{
                months: "flex space-y-4",
                month: "space-y-4",
                month_caption:
                    "relative mx-10 flex h-6 mt-2 items-center justify-center",
                caption_label: "text-sm font-medium",
                nav: "flex items-center h-6",
                button_previous: cn(
                    buttonVariants({ variant: "helper", size: "icon-sm" }),
                    "absolute left-5 top-4",
                ),
                button_next: cn(
                    buttonVariants({ variant: "helper", size: "icon-sm" }),
                    "absolute right-5 top-4",
                ),
                month_grid: "w-full border-collapse space-y-1",
                weekdays: "flex",
                weekday: "text-text-secondary w-8 font-normal text-[0.8rem]",
                week: "flex w-full mt-2",

                // day cell parent and variants
                day: cn(
                    "group",
                    "aria-selected:[&.day-range-end]:*:rounded-r-lg",

                    props.mode === "range"
                        ? "[.day-range-end)]:*:rounded-r-lg [.day-range-start]:*:rounded-l-lg"
                        : "aria-selected:*:rounded-lg",
                ),
                range_start: cn(
                    "day-range-start",
                    " *:rounded-r-none",
                    "aria-selected:*:bg-primary-light aria-selected:*:text-primary-dark",
                ),
                range_middle: cn(
                    "*:rounded-none",
                    "aria-selected:*:bg-primary-light aria-selected:*:text-primary-dark",
                ),
                range_end: cn(
                    "day-range-end",
                    "*:rounded-l-none",
                    "aria-selected:*:bg-primary-light aria-selected:*:text-primary-dark",
                ),
                selected: cn(
                    "*:bg-primary-light *:text-primary-dark",
                    "*:hover:bg-primary-light/75! *:hover:text-primary-dark",
                    "*:focus-visible:bg-primary-light/75! *:focus-visible:text-primary-dark",
                ),
                today: "*:bg-card-lv1 *:text-primary-light",
                outside: cn(
                    "day-outside",
                    "*:text-text-secondary opacity-75",
                    "aria-selected:*:text-primary-dark aria-selected:*:opacity-35",
                ),
                disabled: "*:text-text-secondary *:opacity-50",
                hidden: "*:invisible",

                // day cell child
                day_button: cn(
                    "size-8 text-center text-sm font-normal rounded-lg",
                    "group-not-aria-selected:hover:bg-primary-light/15 group-not-aria-selected:hover:text-primary-light",
                    "group-not-aria-selected:focus-visible:bg-primary-light/15 group-not-aria-selected:focus-visible:text-primary-light",
                    "group-[.day-range-end.day-range-start]:rounded-lg",
                ),
            }}
            components={{
                Chevron: (props) =>
                    props.orientation === "left" ? (
                        <ChevronLeftIcon {...props} />
                    ) : (
                        <ChevronRightIcon {...props} />
                    ),
            }}
        />
    );
}
Calendar.displayName = "Calendar";

export { Calendar };

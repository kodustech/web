"use client";

import { useState } from "react";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Calendar } from "@components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@components/ui/popover";
import { formatDate, isEqual, parseISO, subMonths, subWeeks } from "date-fns";
import { enUS } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { type DayPickerRangeProps } from "react-day-picker";

import { setCockpitDateRangeCookie } from "../_actions/set-cockpit-date-range";

type Props = Omit<DayPickerRangeProps, "mode"> & {
    cookieValue: string | undefined;
};

type DateRangeString = {
    from: string | undefined;
    to: string | undefined;
};

const dateToString = (date: Date) => formatDate(date, "yyyy-MM-dd");
const stringToDate = (date: string) => new Date(parseISO(date));

const today = new Date();
const ranges = [
    {
        label: "Last week",
        range: {
            from: dateToString(subWeeks(today, 1)),
            to: dateToString(today),
        },
    },
    {
        label: "Last 2 weeks",
        range: {
            from: dateToString(subWeeks(today, 2)),
            to: dateToString(today),
        },
    },
    {
        label: "Last month",
        range: {
            from: dateToString(subMonths(today, 1)),
            to: dateToString(today),
        },
    },
    {
        label: "Last 3 months",
        range: {
            from: dateToString(subMonths(today, 3)),
            to: dateToString(today),
        },
    },
] satisfies Array<{
    label: string;
    range: {
        from: string | undefined;
        to: string | undefined;
    };
}>;

const defaultItem = ranges[0];

export const DateRangePicker = ({ cookieValue, ...props }: Props) => {
    const [selectedRange, setSelectedRange] = useState<
        DateRangeString | undefined
    >(() => {
        const cookie = cookieValue;

        if (!cookie) return defaultItem.range;

        let cookieDateRange: DateRangeString;
        try {
            cookieDateRange = JSON.parse(cookie) as DateRangeString;
        } catch (e) {
            return defaultItem.range;
        }

        if (!cookieDateRange.from || !cookieDateRange.to)
            return defaultItem.range;

        return {
            from: cookieDateRange.from,
            to: cookieDateRange.to,
        };
    });
    const [defaultText, setDefaultText] = useState<string | undefined>(() => {
        if (!selectedRange?.from || !selectedRange?.to) return undefined;

        return ranges.find(
            (r) =>
                isEqual(selectedRange?.from!, r.range.from) &&
                isEqual(selectedRange?.to!, r.range.to),
        )?.label;
    });

    const from = selectedRange?.from
        ? formatDate(selectedRange.from, "dd/LLL/y", { locale: enUS })
        : "";
    const to = selectedRange?.to
        ? formatDate(selectedRange.to, "dd/LLL/y", { locale: enUS })
        : "";

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    leftIcon={
                        <CalendarIcon className="text-muted-foreground" />
                    }
                    className="-mt-4 w-64 justify-start text-left font-normal">
                    {defaultText ? (
                        defaultText
                    ) : (
                        <>
                            {selectedRange?.from ? (
                                selectedRange.to ? (
                                    <>
                                        {from}
                                        <span className="text-muted-foreground">
                                            -
                                        </span>
                                        {to}
                                    </>
                                ) : (
                                    from
                                )
                            ) : (
                                <span className="text-muted-foreground">
                                    Select a range
                                </span>
                            )}
                        </>
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent
                align="end"
                className="flex w-72 flex-col items-center px-2 py-0">
                <Calendar
                    {...props}
                    mode="range"
                    disabled={{ after: today }}
                    selected={{
                        from: selectedRange?.from
                            ? stringToDate(selectedRange.from)
                            : undefined,
                        to: selectedRange?.to
                            ? stringToDate(selectedRange.to)
                            : undefined,
                    }}
                    max={31 * 3} // 3 months max range (considering 31 days per month)
                    onSelect={(d) => {
                        const range = {
                            from: d?.from ? dateToString(d?.from) : undefined,
                            to: d?.to
                                ? dateToString(d?.to)
                                : d?.from
                                  ? dateToString(today)
                                  : undefined,
                        };

                        setDefaultText(undefined);
                        setSelectedRange(range);
                        setCockpitDateRangeCookie(range);
                    }}
                />

                <div className="grid grid-cols-2 gap-1 px-4 pb-5">
                    {ranges.map((r) => (
                        <Badge
                            key={r.label}
                            className="h-7 w-full text-xs"
                            variant={
                                isEqual(selectedRange?.from!, r.range.from) &&
                                isEqual(selectedRange?.to!, r.range.to)
                                    ? "secondary"
                                    : "outline"
                            }
                            onClick={() => {
                                setDefaultText(r.label);
                                setSelectedRange({
                                    from: r.range.from,
                                    to: r.range.to,
                                });
                                setCockpitDateRangeCookie(r.range);
                            }}>
                            {r.label}
                        </Badge>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
};

"use client";

import { useState } from "react";
import { Button } from "@components/ui/button";
import { Calendar } from "@components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@components/ui/popover";
import { Separator } from "@components/ui/separator";
import { formatDate, isEqual, parseISO, subMonths, subWeeks } from "date-fns";
import { enUS } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { type PropsRange } from "react-day-picker";

import { setCockpitDateRangeCookie } from "../_actions/set-cockpit-date-range";

type Props = Omit<PropsRange, "mode"> & {
    cookieValue: string | undefined;
};

type DateRangeString = { from: string; to: string };

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
    const [selectedRange, setSelectedRange] = useState<DateRangeString>(() => {
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

    const label = ranges.find(
        (r) =>
            isEqual(selectedRange?.from!, r.range.from) &&
            isEqual(selectedRange?.to!, r.range.to),
    )?.label;

    const from = formatDate(parseISO(selectedRange.from), "dd/LLL/y", {
        locale: enUS,
    });
    const to = formatDate(parseISO(selectedRange.to), "dd/LLL/y", {
        locale: enUS,
    });

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    size="md"
                    variant="helper"
                    leftIcon={<CalendarIcon />}
                    className="-mt-4 w-68 justify-start">
                    {label ? (
                        label
                    ) : (
                        <span className="flex items-center gap-1 font-semibold">
                            {selectedRange?.from ? (
                                selectedRange.to ? (
                                    <>
                                        {from}
                                        <span className="text-text-secondary">
                                            -
                                        </span>
                                        {to}
                                    </>
                                ) : (
                                    from
                                )
                            ) : (
                                <span className="text-text-secondary">
                                    Select a range
                                </span>
                            )}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent
                align="end"
                className="flex w-68 flex-col items-center px-0 py-0">
                <Calendar
                    {...props}
                    mode="range"
                    locale={enUS}
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
                            from: d?.from
                                ? dateToString(d?.from)
                                : defaultItem.range.from,
                            to: d?.to
                                ? dateToString(d?.to)
                                : d?.from
                                  ? dateToString(d.from)
                                  : defaultItem.range.to,
                        };

                        setSelectedRange(range);
                        setCockpitDateRangeCookie(range);
                    }}
                />

                <Separator className="mb-3" />

                <div className="grid grid-cols-2 gap-1 px-0 pb-4">
                    {ranges.map((r) => (
                        <Button
                            key={r.label}
                            size="xs"
                            className="w-full"
                            variant={
                                isEqual(selectedRange?.from!, r.range.from) &&
                                isEqual(selectedRange?.to!, r.range.to)
                                    ? "primary-dark"
                                    : "helper"
                            }
                            onClick={() => {
                                setSelectedRange({
                                    from: r.range.from,
                                    to: r.range.to,
                                });
                                setCockpitDateRangeCookie(r.range);
                            }}>
                            {r.label}
                        </Button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
};

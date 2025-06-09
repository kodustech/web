import { cookies } from "next/headers";
import { formatDate, subWeeks } from "date-fns";
import type { CookieName } from "src/core/utils/cookie";

export const getSelectedDateRange = async (): Promise<{
    startDate: string;
    endDate: string;
}> => {
    const cookieStore = await cookies();
    const selectedDateRangeFromCookie = cookieStore.get(
        "cockpit-selected-date-range" satisfies CookieName,
    )?.value;

    const endDate = new Date();
    const startDate = subWeeks(endDate, 2);

    let parsedDateRangeFromCookie: {
        startDate: Date | string;
        endDate: Date | string;
    } = { startDate, endDate };

    if (selectedDateRangeFromCookie) {
        try {
            const dateRange = JSON.parse(selectedDateRangeFromCookie) as {
                from: string;
                to: string;
            };
            const fromDate = new Date(dateRange.from);
            const toDate = new Date(dateRange.to);

            if (!isNaN(fromDate.getTime()) && !isNaN(toDate.getTime())) {
                parsedDateRangeFromCookie = {
                    startDate: dateRange.from,
                    endDate: dateRange.to,
                };
            }
        } catch (error) {
            console.error("Invalid date range cookie format:", error);
            // Keep default date range
        }
    }

    return {
        startDate: formatDate(
            parsedDateRangeFromCookie.startDate,
            "yyyy-MM-dd",
        ),
        endDate: formatDate(parsedDateRangeFromCookie.endDate, "yyyy-MM-dd"),
    };
};

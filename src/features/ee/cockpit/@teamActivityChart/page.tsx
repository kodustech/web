import { CardContent } from "@components/ui/card";
import { getDeveloperActivity } from "src/features/ee/cockpit/_services/analytics/productivity/fetch";

import { getSelectedDateRange } from "../_helpers/get-selected-date-range";
import { TableNoSSR } from "./_components/table.no-ssr";

export default async function TeamActivityChart() {
    const selectedDateRange = await getSelectedDateRange();

    const data = await getDeveloperActivity({
        startDate: selectedDateRange.startDate,
        endDate: selectedDateRange.endDate,
    });

    if (!data?.length) throw new Error("NO_DATA");

    const groupedByDeveloper = data?.reduce(
        (acc, item) => {
            const { developer, ...rest } = item;
            const existingDeveloper = acc[developer];

            if (existingDeveloper) {
                existingDeveloper.push(rest);
                return acc;
            }

            acc[developer] = [rest];
            return acc;
        },
        {} as Record<
            string,
            Array<{ date: string; commitCount: number; prCount: number }>
        >,
    );

    return (
        <>
            <CardContent className="flex items-center justify-center">
                <TableNoSSR
                    startDate={selectedDateRange.startDate}
                    endDate={selectedDateRange.endDate}
                    data={Object.entries(groupedByDeveloper)}
                />
            </CardContent>
        </>
    );
}

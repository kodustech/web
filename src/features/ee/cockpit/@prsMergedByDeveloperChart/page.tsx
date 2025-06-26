import { CardContent } from "@components/ui/card";
import { getPRsByDeveloper } from "src/features/ee/cockpit/_services/analytics/productivity/fetch";

import { getSelectedDateRange } from "../_helpers/get-selected-date-range";
import { ChartNoSSR } from "./_components/chart.no-ssr";

export default async function PRsMergedByDeveloperChart() {
    const selectedDateRange = await getSelectedDateRange();

    const data = await getPRsByDeveloper({
        startDate: selectedDateRange.startDate,
        endDate: selectedDateRange.endDate,
    });

    if (!data?.length) throw new Error("NO_DATA");

    return (
        <>
            <CardContent className="flex items-center justify-center">
                <ChartNoSSR data={data} />
            </CardContent>
        </>
    );
}

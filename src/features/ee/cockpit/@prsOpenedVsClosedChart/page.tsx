import { CardContent } from "@components/ui/card";
import { getPRsOpenedVsClosed } from "src/features/ee/cockpit/_services/analytics/productivity/fetch";

import { getSelectedDateRange } from "../_helpers/get-selected-date-range";
import { ChartNoSSR } from "./_components/chart.no-ssr";

export default async function PRsOpenedVsClosedChart() {
    const selectedDateRange = await getSelectedDateRange();

    const data = await getPRsOpenedVsClosed({
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

import { CardContent } from "@components/ui/card";
import { getPRsOpenedVsClosed } from "src/features/ee/cockpit/_services/analytics/productivity/fetch";

import { CockpitNoDataPlaceholder } from "../_components/no-data-placeholder";
import { getSelectedDateRange } from "../_helpers/get-selected-date-range";
import { ChartNoSSR } from "./_components/chart.no-ssr";

export default async function PRsOpenedVsClosedChart() {
    const selectedDateRange = await getSelectedDateRange();

    const data = await getPRsOpenedVsClosed({
        startDate: selectedDateRange.startDate,
        endDate: selectedDateRange.endDate,
    });

    if (data?.length === 0) {
        return <CockpitNoDataPlaceholder />;
    }

    return (
        <>
            <CardContent className="flex items-center justify-center">
                <ChartNoSSR data={data} />
            </CardContent>
        </>
    );
}

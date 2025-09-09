import { CardContent } from "@components/ui/card";
import { getPRsByDeveloper } from "src/features/ee/cockpit/_services/analytics/productivity/fetch";

import { CockpitNoDataPlaceholder } from "../_components/no-data-placeholder";
import { getSelectedDateRange } from "../_helpers/get-selected-date-range";
import { ChartNoSSR } from "./_components/chart.no-ssr";

export default async function PRsMergedByDeveloperChart() {
    const selectedDateRange = await getSelectedDateRange();

    const data = await getPRsByDeveloper({
        startDate: selectedDateRange.startDate,
        endDate: selectedDateRange.endDate,
    });

    // Handle both direct array response and wrapped {status, data} response
    const actualData = Array.isArray(data) ? data : (data as any)?.data || [];

    if (!actualData || actualData.length === 0) {
        return <CockpitNoDataPlaceholder />;
    }

    return (
        <>
            <CardContent className="flex items-center justify-center">
                <ChartNoSSR data={actualData} />
            </CardContent>
        </>
    );
}

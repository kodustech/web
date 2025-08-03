import { CardContent } from "@components/ui/card";
import { getLeadTimeBreakdown } from "src/features/ee/cockpit/_services/analytics/productivity/fetch";

import { CockpitNoDataPlaceholder } from "../_components/no-data-placeholder";
import { getSelectedDateRange } from "../_helpers/get-selected-date-range";
import { ChartNoSSR } from "./_components/chart.no-ssr";

export default async function LeadTimeBreakdownChart() {
    const selectedDateRange = await getSelectedDateRange();

    const data = await getLeadTimeBreakdown({
        startDate: selectedDateRange.startDate,
        endDate: selectedDateRange.endDate,
    });

    if (data?.length === 0) {
        return <CockpitNoDataPlaceholder />;
    }

    return (
        <CardContent className="flex items-center justify-center">
            <ChartNoSSR data={data} />
        </CardContent>
    );
}

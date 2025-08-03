import { CardContent } from "@components/ui/card";
import { DataTable } from "@components/ui/data-table";
import { getCodeHealthSuggestionsByRepository } from "src/features/ee/cockpit/_services/analytics/code-health/fetch";

import { CockpitNoDataPlaceholder } from "../_components/no-data-placeholder";
import { getSelectedDateRange } from "../_helpers/get-selected-date-range";
import { columns } from "./_components/columns";

export default async function CodeHealthByRepository() {
    const selectedDateRange = await getSelectedDateRange();

    const data = await getCodeHealthSuggestionsByRepository({
        startDate: selectedDateRange.startDate,
        endDate: selectedDateRange.endDate,
    });

    if (data?.length === 0) {
        return <CockpitNoDataPlaceholder className="mt-0 h-60" />;
    }

    return (
        <>
            <CardContent className="px-0 pb-0 [&_th]:leading-tight">
                <DataTable columns={columns} data={data} />
            </CardContent>
        </>
    );
}

import { CardContent } from "@components/ui/card";
import { DataTable } from "@components/ui/data-table";
import { getCodeHealthSuggestionsByRepository } from "src/features/ee/cockpit/_services/analytics/code-health/fetch";

import { getSelectedDateRange } from "../_helpers/get-selected-date-range";
import { columns } from "./_components/columns";

export default async function CodeHealthByRepository() {
    const selectedDateRange = await getSelectedDateRange();

    const data = await getCodeHealthSuggestionsByRepository({
        startDate: selectedDateRange.startDate,
        endDate: selectedDateRange.endDate,
    });

    if (!data?.length) throw new Error("NO_DATA");

    return (
        <>
            <CardContent>
                <DataTable columns={columns} data={data} />
            </CardContent>
        </>
    );
}

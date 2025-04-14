import { CardContent } from "@components/ui/card";

import { getKodySuggestionsAnalytics } from "../_services/analytics/productivity/fetch";
import { Chart } from "./_components/chart";

export default async function KodySuggestions() {
    const data = await getKodySuggestionsAnalytics();

    if (data.suggestionsSent === 0 && data.suggestionsImplemented === 0) {
        throw new Error("NO_DATA");
    }

    return (
        <>
            <CardContent className="pb-3">
                <Chart data={data} />
            </CardContent>
        </>
    );
}

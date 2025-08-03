import { CardContent } from "@components/ui/card";

import { getKodySuggestionsAnalytics } from "../_services/analytics/productivity/fetch";
import { Chart } from "./_components/chart";
import NoData from "./_components/no-data";

export default async function KodySuggestions() {
    const data = await getKodySuggestionsAnalytics();

    if (data.suggestionsSent === 0 && data.suggestionsImplemented === 0) {
        return <NoData />;
    }

    return (
        <CardContent>
            <Chart data={data} />
        </CardContent>
    );
}

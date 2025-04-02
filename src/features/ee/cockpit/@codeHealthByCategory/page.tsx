import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { capitalize } from "src/core/utils/string";
import { getCodeHealthSuggestionsByCategory } from "src/features/ee/cockpit/_services/analytics/code-health/fetch";

import { getSelectedDateRange } from "../_helpers/get-selected-date-range";

export default async function CodeHealthByCategory() {
    const selectedDateRange = await getSelectedDateRange();

    const data = await getCodeHealthSuggestionsByCategory({
        startDate: selectedDateRange.startDate,
        endDate: selectedDateRange.endDate,
    });

    if (!data?.length) throw new Error("NO_DATA");

    return (
        <>
            <Card className="col-span-2 bg-transparent">
                <CardHeader className="text-sm text-muted-foreground">
                    The card(s) displays the number of Suggestions Provided by
                    Kody for each active Analysis Types. The data is filtered
                    based on the number of suggestions sent to the team within
                    the chosen time period.
                </CardHeader>
            </Card>

            {data?.map((d) => {
                const categoryName = d.category
                    .split("_")
                    .map(capitalize)
                    .join(" ");

                return (
                    <Card key={d.category}>
                        <CardHeader>
                            <CardTitle className="text-sm">
                                {categoryName}
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="flex items-end gap-1">
                            <div className="text-2xl font-bold leading-5">
                                {d.count}
                            </div>{" "}
                            <small className="text-muted-foreground">
                                issues
                            </small>
                        </CardContent>
                    </Card>
                );
            })}
        </>
    );
}

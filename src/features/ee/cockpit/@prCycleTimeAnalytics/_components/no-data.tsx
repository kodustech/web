import { CardContent } from "@components/ui/card";

import { CockpitNoDataPlaceholder } from "../../_components/no-data-placeholder";
import { PRCycleTimeAnalyticsHeader } from "./header";

export default function NoData() {
    return (
        <>
            <PRCycleTimeAnalyticsHeader />

            <CardContent className="flex items-center justify-center">
                <CockpitNoDataPlaceholder mini />
            </CardContent>
        </>
    );
}

import { CardContent } from "@components/ui/card";

import { CockpitNoDataPlaceholder } from "../../_components/no-data-placeholder";
import { BugRatioAnalyticsHeader } from "./header";

export default function NoData() {
    return (
        <>
            <BugRatioAnalyticsHeader />

            <CardContent className="flex items-center justify-center">
                <CockpitNoDataPlaceholder mini />
            </CardContent>
        </>
    );
}

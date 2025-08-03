import { CardContent } from "@components/ui/card";

import { CockpitNoDataPlaceholder } from "../../_components/no-data-placeholder";
import { PRSizeAnalyticsHeader } from "./header";

export default function NoData() {
    return (
        <>
            <PRSizeAnalyticsHeader />

            <CardContent className="flex items-center justify-center">
                <CockpitNoDataPlaceholder mini />
            </CardContent>
        </>
    );
}

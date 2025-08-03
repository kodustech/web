import { CardContent } from "@components/ui/card";

import { CockpitNoDataPlaceholder } from "../../_components/no-data-placeholder";
import { DeployFrequencyAnalyticsHeader } from "./header";

export default function NoData() {
    return (
        <>
            <DeployFrequencyAnalyticsHeader />

            <CardContent className="flex items-center justify-center">
                <CockpitNoDataPlaceholder mini />
            </CardContent>
        </>
    );
}

import { CardContent } from "@components/ui/card";

import { CockpitNoDataPlaceholder } from "../../_components/no-data-placeholder";

export default function NoData() {
    return (
        <CardContent className="flex items-center justify-center">
            <CockpitNoDataPlaceholder mini />
        </CardContent>
    );
}

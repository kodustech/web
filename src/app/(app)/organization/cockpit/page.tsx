import { getCockpitMetricsVisibility } from "@services/organizationParameters/fetch";
import { getOrganizationId } from "@services/organizations/fetch";

import { CockpitOrganizationSettingsPage } from "./_page-component";

export default async function CockpitSettingsPage() {
    const organizationId = await getOrganizationId();

    const cockpitMetricsVisibility =
        await getCockpitMetricsVisibility({ organizationId });

    return (
        <CockpitOrganizationSettingsPage
            cockpitMetricsVisibility={cockpitMetricsVisibility}
        />
    );
}


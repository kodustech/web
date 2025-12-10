import { getCockpitMetricsVisibility } from "@services/organizationParameters/fetch";

import { CockpitOrganizationSettingsPage } from "./_page-component";

export default async function CockpitSettingsPage() {
    const cockpitMetricsVisibility = await getCockpitMetricsVisibility();

    return (
        <CockpitOrganizationSettingsPage
            cockpitMetricsVisibility={cockpitMetricsVisibility}
        />
    );
}

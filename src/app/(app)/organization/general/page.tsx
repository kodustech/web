import { typedFetch, TypedFetchError } from "@services/fetch";
import { ORGANIZATION_PARAMETERS_PATHS } from "@services/organizationParameters";
import { getOrganizationParameterByKey } from "@services/organizationParameters/fetch";
import { getOrganizationId } from "@services/organizations/fetch";
import {
    OrganizationParametersConfigKey,
    Timezone,
} from "@services/parameters/types";

import { GeneralOrganizationSettingsPage } from "./_page-component";

export default async function OrganizationSettingsPage() {
    const organizationId = await getOrganizationId();

    let configValue: Timezone = Timezone.NEW_YORK;

    try {
        // Get organization timezone
        const result = await getOrganizationParameterByKey<{
            configValue: Timezone;
        }>({
            key: OrganizationParametersConfigKey.TIMEZONE_CONFIG,
            organizationId,
        });

        // If it exists, use it
        configValue = result?.configValue;
    } catch (error: unknown) {
        if (error instanceof TypedFetchError) {
            if (error.statusCode === 404) {
                // If it doesn't exist, create it
                await typedFetch(
                    ORGANIZATION_PARAMETERS_PATHS.CREATE_OR_UPDATE,
                    {
                        method: "POST",
                        body: JSON.stringify({
                            key: OrganizationParametersConfigKey.TIMEZONE_CONFIG,
                            configValue,
                            organizationAndTeamData: { organizationId },
                        }),
                    },
                );
            }
        }
    }

    return <GeneralOrganizationSettingsPage timezone={configValue} />;
}

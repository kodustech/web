import { typedFetch, TypedFetchError } from "@services/fetch";
import { ORGANIZATION_PARAMETERS_PATHS } from "@services/organizationParameters";
import { getOrganizationParameterByKey } from "@services/organizationParameters/fetch";
import { getOrganizationId } from "@services/organizations/fetch";
import {
    OrganizationParametersAutoJoinConfig,
    OrganizationParametersConfigKey,
    Timezone,
} from "@services/parameters/types";
import { getJwtPayload } from "src/lib/auth/utils";

import { GeneralOrganizationSettingsPage } from "./_page-component";

export default async function OrganizationSettingsPage() {
    const organizationId = await getOrganizationId();
    const jwtPayload = await getJwtPayload();
    const email = jwtPayload?.email ?? "";
    const userDomain = email.split("@")[1];

    let timezoneConfigValue: Timezone = Timezone.NEW_YORK;
    let autoJoinConfigValue: OrganizationParametersAutoJoinConfig = {
        enabled: false,
        domains: [userDomain],
    };

    try {
        const result = await getOrganizationParameterByKey<{
            configValue: Timezone;
        }>({
            key: OrganizationParametersConfigKey.TIMEZONE_CONFIG,
            organizationId,
        });

        if (result?.configValue) {
            timezoneConfigValue = result.configValue;
        }
    } catch (error: unknown) {
        if (error instanceof TypedFetchError && error.statusCode === 404) {
            await typedFetch(ORGANIZATION_PARAMETERS_PATHS.CREATE_OR_UPDATE, {
                method: "POST",
                body: JSON.stringify({
                    key: OrganizationParametersConfigKey.TIMEZONE_CONFIG,
                    configValue: timezoneConfigValue,
                    organizationAndTeamData: { organizationId },
                }),
            });
        }
    }

    try {
        const result = await getOrganizationParameterByKey<{
            configValue: OrganizationParametersAutoJoinConfig;
        }>({
            key: OrganizationParametersConfigKey.AUTO_JOIN_CONFIG,
            organizationId,
        });

        if (result?.configValue) {
            autoJoinConfigValue = result.configValue;
        }
    } catch (error: unknown) {
        if (error instanceof TypedFetchError && error.statusCode === 404) {
            await typedFetch(ORGANIZATION_PARAMETERS_PATHS.CREATE_OR_UPDATE, {
                method: "POST",
                body: JSON.stringify({
                    key: OrganizationParametersConfigKey.AUTO_JOIN_CONFIG,
                    configValue: autoJoinConfigValue,
                    organizationAndTeamData: { organizationId },
                }),
            });
        }
    }
    return (
        <GeneralOrganizationSettingsPage
            email={email}
            timezone={timezoneConfigValue}
            autoJoinConfig={autoJoinConfigValue}
        />
    );
}

import { redirect } from "next/navigation";
import { getOrganizationParameterByKey } from "@services/organizationParameters/fetch";
import { getOrganizationId } from "@services/organizations/fetch";
import { OrganizationParametersConfigKey } from "@services/parameters/types";
import { getGlobalSelectedTeamId } from "src/core/utils/get-global-selected-team-id";

import { validateOrganizationLicense } from "../subscription/_services/billing/fetch";
import { ByokPageClient } from "./_components/page.client";
import type { BYOKConfig } from "./_types";
import { isBYOKSubscriptionPlan } from "./_utils";

export default async function ByokPage() {
    const organizationId = await getOrganizationId();
    const teamId = await getGlobalSelectedTeamId();
    const subscription = await validateOrganizationLicense({ teamId });

    if (!isBYOKSubscriptionPlan(subscription)) redirect("/organization");

    const byokConfig = await getOrganizationParameterByKey<{
        configValue: { main: BYOKConfig; fallback: BYOKConfig };
    }>({
        key: OrganizationParametersConfigKey.BYOK_CONFIG,
        organizationId,
    });

    return <ByokPageClient config={byokConfig?.configValue} />;
}

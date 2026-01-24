import { redirect } from "next/navigation";
import { getBYOK } from "@services/organizationParameters/fetch";
import { getGlobalSelectedTeamId } from "src/core/utils/get-global-selected-team-id";

import { validateOrganizationLicense } from "../subscription/_services/billing/fetch";
import { ByokPageClient } from "./_components/page.client";
import { isBYOKSubscriptionPlan } from "./_utils";

export default async function ByokPage() {
    const byokConfig = await getBYOK().catch(() => null);

    return <ByokPageClient config={byokConfig} />;
}

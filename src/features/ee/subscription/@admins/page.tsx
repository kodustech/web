import { authorizedFetch } from "@services/fetch";
import { getIntegrationConfig } from "@services/integrations/integrationConfig/fetch";
import { SETUP_PATHS } from "@services/setup";
import type { TeamMembersResponse } from "@services/setup/types";
import { getGlobalSelectedTeamId } from "src/core/utils/get-global-selected-team-id";

import { AdminsPageClient } from "./_components/page.client";

export default async function SubscriptionTabs() {
    const teamId = await getGlobalSelectedTeamId();
    const { members } = await authorizedFetch<TeamMembersResponse>(
        SETUP_PATHS.TEAM_MEMBERS,
        { params: { teamId } },
    );

    return <AdminsPageClient data={members} />;
}

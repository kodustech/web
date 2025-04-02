import { typedFetch } from "@services/fetch";
import { SETUP_PATHS } from "@services/setup";
import type { TeamMembersResponse } from "@services/setup/types";
import { getGlobalSelectedTeamId } from "src/core/utils/get-global-selected-team-id";

import { Redirect } from "./_components";

export default async function SubscriptionStatus() {
    const teamId = await getGlobalSelectedTeamId();
    const [{ members }] = await Promise.all([
        typedFetch<TeamMembersResponse>(SETUP_PATHS.TEAM_MEMBERS, {
            params: { teamId },
        }),
    ]);

    return <Redirect members={members} />;
}

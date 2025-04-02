import { DataTable } from "@components/ui/data-table";
import { typedFetch } from "@services/fetch";
import { SETUP_PATHS } from "@services/setup";
import type { TeamMembersResponse } from "@services/setup/types";
import { getGlobalSelectedTeamId } from "src/core/utils/get-global-selected-team-id";

import { columns } from "./_components/columns";

export default async function SubscriptionTabs() {
    const teamId = await getGlobalSelectedTeamId();
    const [{ members }] = await Promise.all([
        typedFetch<TeamMembersResponse>(SETUP_PATHS.TEAM_MEMBERS, {
            params: { teamId },
        }),
    ]);

    return (
        <DataTable
            columns={columns}
            data={members}
            EmptyComponent={
                <div className="flex h-24 items-center justify-center text-center">
                    No organization admins found
                </div>
            }
        />
    );
}

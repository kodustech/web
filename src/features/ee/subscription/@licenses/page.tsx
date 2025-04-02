import { DataTable } from "@components/ui/data-table";
import { getGlobalSelectedTeamId } from "src/core/utils/get-global-selected-team-id";

import {
    getPullRequestAuthors,
    getUsersWithLicense,
    validateOrganizationLicense,
} from "../_services/billing/fetch";
import { columns } from "./_components/columns";

export default async function SubscriptionTabs() {
    const teamId = await getGlobalSelectedTeamId();
    const pullRequestAuthors = await getPullRequestAuthors();
    const usersWithLicense = await getUsersWithLicense({ teamId });
    const license = await validateOrganizationLicense({ teamId });

    const pullRequestAuthorsWithLicense: {
        id: number;
        name: string;
        licenseStatus: "active" | "inactive";
    }[] = pullRequestAuthors.map((author) => {
        const user = usersWithLicense.find(
            (user) => user.git_id === author.id.toString(),
        );

        return {
            id: author.id,
            name: author.name,
            licenseStatus:
                license.valid && license.subscriptionStatus === "trial"
                    ? "active"
                    : user?.git_id
                      ? "active"
                      : "inactive",
        };
    });

    return <DataTable columns={columns} data={pullRequestAuthorsWithLicense} />;
}

import { getGlobalSelectedTeamId } from "src/core/utils/get-global-selected-team-id";

import {
    getPullRequestAuthors,
    getUsersWithLicense,
    validateOrganizationLicense,
} from "../_services/billing/fetch";
import { LicensesPageClient } from "./_components/page.client";

export default async function SubscriptionTabs() {
    const teamId = await getGlobalSelectedTeamId();

    const [pullRequestAuthors, usersWithLicense, license] = await Promise.all([
        getPullRequestAuthors().catch(() => []),
        getUsersWithLicense({ teamId }),
        validateOrganizationLicense({ teamId }),
    ]);

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

    return <LicensesPageClient data={pullRequestAuthorsWithLicense} />;
}

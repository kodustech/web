import { getGlobalSelectedTeamId } from "src/core/utils/get-global-selected-team-id";

import {
    getOrganizationMembers,
    getUsersWithLicense,
    validateOrganizationLicense,
} from "../_services/billing/fetch";
import { LicensesPageClient } from "./_components/page.client";
import type { LicenseTableRow } from "./_components/columns";

export default async function SubscriptionTabs() {
    const teamId = await getGlobalSelectedTeamId();

    const [organizationMembersRaw, usersWithLicense, license] =
        await Promise.all([
            getOrganizationMembers({ teamId }).catch(() => []),
            getUsersWithLicense({ teamId }),
            validateOrganizationLicense({ teamId }),
        ]);

    const organizationMembers = Array.isArray(organizationMembersRaw)
        ? organizationMembersRaw
        : [];

    const organizationMembersWithLicense: LicenseTableRow[] =
        organizationMembers.map((member) => {
            const normalizedName =
                member.name?.trim() ||
                member.displayName?.trim() ||
                member.username?.trim() ||
                member.login?.trim() ||
                "Unknown member";

            const user = usersWithLicense.find(
                (userWithLicense) =>
                    userWithLicense.git_id === member.id.toString(),
            );

            return {
                id: member.id,
                name: normalizedName,
                licenseStatus:
                    license.valid && license.subscriptionStatus === "trial"
                        ? "active"
                        : user?.git_id
                          ? "active"
                          : "inactive",
            };
        });

    return <LicensesPageClient data={organizationMembersWithLicense} />;
}

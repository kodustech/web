import { redirect } from "next/navigation";
import {
    getOrganizationId,
    getOrganizationName,
} from "@services/organizations/fetch";
import { getTeams } from "@services/teams/fetch";
import { AllTeamsProvider } from "src/core/providers/all-teams-context";
import { AuthProvider } from "src/core/providers/auth.provider";
import { SelectedTeamProvider } from "src/core/providers/selected-team-context";
import { OrganizationProvider } from "src/features/organization/_providers/organization-context";
import { getJwtPayload } from "src/lib/auth/utils";

export default async function Layout(props: React.PropsWithChildren) {
    const jwtPayload = await getJwtPayload();
    if (!jwtPayload) return redirect("/sign-in");

    const [teams, organizationId, organizationName] = await Promise.all([
        getTeams(),
        getOrganizationId(),
        getOrganizationName(),
    ]);

    return (
        <AuthProvider jwtPayload={jwtPayload}>
            <OrganizationProvider
                organization={{ id: organizationId, name: organizationName }}>
                <AllTeamsProvider teams={teams}>
                    <SelectedTeamProvider>
                        {props.children}
                    </SelectedTeamProvider>
                </AllTeamsProvider>
            </OrganizationProvider>
        </AuthProvider>
    );
}

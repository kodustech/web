"use client";

import { PropsWithChildren } from "react";
import { MagicModalPortal } from "@components/ui/magic-modal";
import { PermissionsMap } from "@services/permissions/types";
import type { Team } from "@services/teams/types";
import type { Session } from "next-auth";
import { AllTeamsProvider } from "src/core/providers/all-teams-context";
import { AuthProvider } from "src/core/providers/auth.provider";
import { PermissionsProvider } from "src/core/providers/permissions.provider";
import { SelectedTeamProvider } from "src/core/providers/selected-team-context";
import { OrganizationProvider } from "src/features/organization/_providers/organization-context";

type ProvidersProps = PropsWithChildren<{
    teams: Team[];
    session: Session | null;
    organization: {
        id: string;
        name: string;
    };
    permissions: PermissionsMap;
}>;

export function Providers({
    children,
    teams,
    session,
    organization,
    permissions,
}: ProvidersProps) {
    return (
        <AuthProvider session={session}>
            <PermissionsProvider permissions={permissions}>
                <OrganizationProvider organization={organization}>
                    <AllTeamsProvider teams={teams}>
                        <SelectedTeamProvider>
                            {children}
                            <MagicModalPortal />
                        </SelectedTeamProvider>
                    </AllTeamsProvider>
                </OrganizationProvider>
            </PermissionsProvider>
        </AuthProvider>
    );
}

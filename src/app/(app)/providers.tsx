"use client";

import { PropsWithChildren } from "react";
import { MagicModalPortal } from "@components/ui/magic-modal";
import type { Team } from "@services/teams/types";
import type { User } from "@services/users/types";
import { JWTPayload } from "jose";
import { AllTeamsProvider } from "src/core/providers/all-teams-context";
import { AuthProvider } from "src/core/providers/auth.provider";
import { SelectedTeamProvider } from "src/core/providers/selected-team-context";
import { OrganizationProvider } from "src/features/organization/_providers/organization-context";

type ProvidersProps = PropsWithChildren<{
    teams: Team[];
    jwtPayload: JWTPayload;
    user: User;
    organization: {
        id: string;
        name: string;
    };
}>;

export function Providers({
    children,
    teams,
    jwtPayload,
    organization,
    user,
}: ProvidersProps) {
    return (
        <AuthProvider user={user} jwtPayload={jwtPayload}>
            <OrganizationProvider organization={organization}>
                <AllTeamsProvider teams={teams}>
                    <SelectedTeamProvider>
                        {children}
                        <MagicModalPortal />
                    </SelectedTeamProvider>
                </AllTeamsProvider>
            </OrganizationProvider>
        </AuthProvider>
    );
}

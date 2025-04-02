"use client";

import { createContext, useContext } from "react";
import type { TODO } from "src/core/types";

import { Role, TeamRole } from "../utils/permissions";

interface AuthContextProps {
    userRole: Role;
    userTeamRole: TeamRole;
    isOwner: boolean;
    isTeamLeader: boolean;
    isTeamMember: boolean;
    email?: string;
    userId?: string;
    jwt: string;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

type AuthProviderProps = React.PropsWithChildren & {
    jwtPayload: TODO;
};

export const AuthProvider = ({ children, jwtPayload }: AuthProviderProps) => {
    const userRole = jwtPayload.role || Role.USER;
    const userTeamRole = jwtPayload.teamRole || TeamRole.MEMBER;

    return (
        <AuthContext.Provider
            value={{
                userRole,
                userTeamRole,
                isOwner: userRole === Role.OWNER,
                isTeamLeader: userTeamRole === TeamRole.TEAM_LEADER,
                isTeamMember: userTeamRole === TeamRole.MEMBER,
                email: jwtPayload.email,
                userId: jwtPayload.sub,
                jwt: jwtPayload.jwt,
            }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextProps => {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    return context;
};

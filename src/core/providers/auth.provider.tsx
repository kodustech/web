"use client";

import { createContext, use } from "react";
import { redirect } from "next/navigation";
import { TeamRole, UserRole } from "@enums";
import type { UserStatus } from "@services/setup/types";
import { useSession } from "next-auth/react";

import { parseJwt } from "../utils/helpers";

interface AuthContextProps {
    userRole: UserRole;
    userTeamRole: TeamRole;
    isOwner: boolean;
    isTeamLeader: boolean;
    status: UserStatus;
    email: string;
    userId: string;
    jwt: string;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

type AuthProviderProps = React.PropsWithChildren & {};

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const { data } = useSession();
    const token = data?.user?.accessToken;
    const jwtPayload = parseJwt(token)?.payload;
    if (!jwtPayload) redirect("/sign-out");

    const userRole = jwtPayload.role || UserRole.USER;
    const userTeamRole = jwtPayload.teamRole || TeamRole.TEAM_MEMBER;

    return (
        <AuthContext
            value={{
                userRole,
                userTeamRole,
                isOwner: userRole === UserRole.OWNER,
                isTeamLeader: userTeamRole === TeamRole.TEAM_LEADER,
                email: jwtPayload.email,
                userId: jwtPayload.sub,
                status: jwtPayload.status,
                jwt: data?.user.accessToken!,
            }}>
            {children}
        </AuthContext>
    );
};

export const useAuth = (): AuthContextProps => {
    const context = use(AuthContext);

    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    return context;
};

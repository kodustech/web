"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { TeamRole, UserRole } from "@enums";
import { type User } from "@services/users/types";
import type { TODO } from "src/core/types";

interface AuthContextProps {
    userRole: UserRole;
    userTeamRole: TeamRole;
    isOwner: boolean;
    isTeamLeader: boolean;
    email: string;
    userId: string;
    jwt: string;
    setUserInfo: (userInfo: User) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

type AuthProviderProps = React.PropsWithChildren & {
    jwtPayload: TODO;
    user: User;
};

export const AuthProvider = ({
    children,
    user,
    jwtPayload,
}: AuthProviderProps) => {
    const [userInfo, setUserInfo] = useState(user);
    useEffect(() => setUserInfo(user), [user]);

    const userRole = userInfo.role || UserRole.USER;
    const userTeamRole = jwtPayload.teamRole || TeamRole.TEAM_MEMBER;

    return (
        <AuthContext.Provider
            value={{
                userRole,
                userTeamRole,
                isOwner: userRole === UserRole.OWNER,
                isTeamLeader: userTeamRole === TeamRole.TEAM_LEADER,
                email: user.email,
                userId: user.uuid,
                jwt: jwtPayload.jwt,
                setUserInfo,
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

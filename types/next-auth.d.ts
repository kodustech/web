import type { UserRole, UserStatus } from "@enums";

declare module "next-auth" {
    interface Session {
        user: {
            accessToken: string;
            refreshToken: string;
            role: UserRole;
            status: UserStatus;
            userId: string;
            email: string;
            organizationId: string;
            reason?: "expired-token";

            exp: number;
            iat: number;
        };
    }

    interface User {
        accessToken: string;
        refreshToken: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        accessToken: string;
        refreshToken: string;
        role: UserRole;
        status: UserStatus;
        email: string;
        organizationId: string;
        reason?: "expired-token";
        sub: string;
        exp: number;
        iat: number;
    }
}

export default {};

"use client";

import { useRouter } from "next/navigation";
import { toast } from "@components/ui/toaster/use-toast";
import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { SessionProvider, useSession } from "next-auth/react";
import { refreshAccessToken } from "src/lib/auth/fetchers";

export const AuthProvider = (props: {
    children: React.PropsWithChildren["children"];
    session: Session | null;
}) => {
    return (
        <SessionProvider
            {...props}
            refetchInterval={0}
            refetchOnWindowFocus={false}
        />
    );
};

export const useAuth = () => {
    const router = useRouter();

    const { data, update } = useSession({
        required: true,
        onUnauthenticated: () => {
            toast({
                title: "You were disconnected",
                variant: "info",
            });
            router.replace("/sign-out");
        },
    });

    const refreshToken = data?.user.refreshToken!;

    return {
        role: data?.user.role!,
        teamRole: data?.user.teamRole!,
        email: data?.user.email!,
        userId: data?.user.userId!,
        status: data?.user.status!,
        accessToken: data?.user.accessToken!,
        refreshToken,
        organizationId: data?.user.organizationId,
        refreshAccessTokens: async () => {
            const newTokens = await refreshAccessToken({ refreshToken });

            const updatedToken = await update(newTokens);

            console.log(refreshToken?.slice(-4));
            console.log(newTokens.refreshToken.slice(-4));
            console.log(updatedToken?.user.refreshToken?.slice(-4));

            return updatedToken;
        },
    } satisfies Partial<JWT>;
};

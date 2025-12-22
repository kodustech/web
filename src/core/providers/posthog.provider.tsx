"use client";

import { type PropsWithChildren, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { flushPosthogAuthEvents, identifyPosthogUser } from "../utils/posthog-client";

export const PosthogProvider = ({ children }: PropsWithChildren) => {
    const { data } = useSession();
    const user = data?.user;
    const lastIdentifiedRef = useRef<string | null>(null);

    useEffect(() => {
        if (!user?.userId) return;
        if (lastIdentifiedRef.current === user.userId) return;

        identifyPosthogUser({
            userId: user.userId,
            email: user.email,
            organizationId: user.organizationId,
        });

        lastIdentifiedRef.current = user.userId;
        flushPosthogAuthEvents();
    }, [user?.userId, user?.email, user?.organizationId]);

    return <>{children}</>;
};

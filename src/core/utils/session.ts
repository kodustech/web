import { typedFetch } from "@services/fetch";
import type { Session } from "next-auth";

export const getJWTToken = async () => {
    const session = await typedFetch<Session | null>("/api/auth/session");
    return session?.user?.accessToken;
};

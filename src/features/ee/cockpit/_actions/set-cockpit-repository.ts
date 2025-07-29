"use server";

import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import type { CookieName } from "src/core/utils/cookie";

export const setCockpitRepositoryCookie = async (repository: string) => {
    const cookieStore = await cookies();
    
    cookieStore.set(
        "cockpit-selected-repository" satisfies CookieName,
        JSON.stringify(repository),
        {
            sameSite: "lax",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        },
    );

    revalidateTag("cockpit-date-range-dependent");
    revalidateTag("cockpit-repository-dependent");
};
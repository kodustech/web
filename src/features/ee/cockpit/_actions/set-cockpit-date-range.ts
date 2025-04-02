"use server";

import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";

export const setCockpitDateRangeCookie = async (range: {
    from: string | undefined;
    to: string | undefined;
}) => {
    const cookieStore = await cookies();

    cookieStore.set({
        name: "cockpit-selected-date-range",
        value: JSON.stringify(range),
    });

    revalidateTag("cockpit-date-range-dependent");
};

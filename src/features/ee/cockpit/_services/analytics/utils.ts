import { typedFetch } from "@services/fetch";

import type { PercentageDiff } from "../../_components/percentage-diff";

export const analyticsFetch = async <Data>(
    url: `/${string}`,
    options: Parameters<typeof typedFetch>["1"] = {},
) => {
    // const organizationId = await getOrganizationId();
    const organizationId = "3bc1e218-0f3b-41e5-adfc-c4b42ee3ed13";

    if (!process.env.WEB_ANALYTICS_SECRET) {
        console.warn(
            "WEB_ANALYTICS_SECRET is not configured. Analytics requests will be skipped.",
        );
        return null as Data;
    }

    try {
        return await typedFetch<Data>(
            `${process.env.WEB_ANALYTICS_HOSTNAME}/api/${url}`,
            {
                ...options,
                params: { ...options.params, organizationId },
                headers: {
                    ...options?.headers,
                    "x-api-key": process.env.WEB_ANALYTICS_SECRET,
                },
            },
        );
    } catch (error) {
        if (error instanceof Error) {
            // Avoid throwing errors that could cause unwanted redirects
            console.error(`Analytics request failed: ${error.message}`);
            return null as Data;
        }
        throw error;
    }
};

/**
 * startDate/endDate: Represents a date string in ISO format (YYYY-MM-DD).
 */
export type AnalyticsParams = {
    startDate: string;
    endDate: string;
};

export const getPercentageDiff = ({
    trend,
}: {
    trend: string;
}): React.ComponentProps<typeof PercentageDiff>["status"] => {
    switch (trend) {
        case "unchanged":
            return "neutral";

        case "improved":
            return "good";

        case "worsened":
            return "bad";

        default:
            return "neutral";
    }
};

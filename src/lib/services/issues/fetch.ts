import { axiosAuthorized } from "src/core/utils/axios";
import { pathToApiUrl } from "src/core/utils/helpers";

export const getIssuesWithPagination = async (params: {
    organizationId: string;
    limit: number;
    page: number;
    filters: Record<string, string>;
}) => {
    const response = await axiosAuthorized.fetcher(pathToApiUrl("/issues"), {
        params: {
            organizationId: params.organizationId,
            limit: params.limit,
            page: params.page,
        },
    });

    return (response.data.data ?? []) as Array<{
        contributingSuggestions: Array<Record<string, unknown>>;
        description: string;
        filePath: string;
        createdAt: string;
        language: string;
        repository: { name: string };
        representativeSuggestion: { id: string };
        severity: "low" | "medium" | "high" | "critical";
        status: "open" | "closed";
        title: string;
        uuid: string;
        label: string;
    }>;
};

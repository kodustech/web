import { useCodeReviewRouteParams } from "src/app/(app)/settings/_hooks";
import {
    DEFAULT_END_REVIEW_MESSAGE,
    DEFAULT_START_REVIEW_MESSAGE,
} from "src/app/(app)/settings/code-review/[repositoryId]/custom-messages/_components/options";
import { pathToApiUrl } from "src/core/utils/helpers";
import { useSuspenseFetch } from "src/core/utils/reactQuery";
import { useOrganizationContext } from "src/features/organization/_providers/organization-context";

export const useSuspensePullRequestMessages = () => {
    const { repositoryId, directoryId } = useCodeReviewRouteParams();
    const { organizationId } = useOrganizationContext();

    return useSuspenseFetch<{
        uuid: string;
        repositoryId: string | null;
        directoryId?: string;
        startReviewMessage: {
            content: string;
            status: "active" | "inactive";
        };
        endReviewMessage: {
            content: string;
            status: "active" | "inactive";
        };
    }>(
        directoryId
            ? pathToApiUrl("/pull-request-messages/find-by-directory-id")
            : pathToApiUrl("/pull-request-messages/find-by-organization-id"),
        {
            params: {
                organizationId,
                repositoryId,
                directoryId,
            },
        },
        {
            fallbackData: {
                uuid: undefined as any,
                repositoryId,
                directoryId,
                startReviewMessage: {
                    content: DEFAULT_START_REVIEW_MESSAGE,
                    status: "active",
                },
                endReviewMessage: {
                    content: DEFAULT_END_REVIEW_MESSAGE,
                    status: "active",
                },
            },
        },
    );
};

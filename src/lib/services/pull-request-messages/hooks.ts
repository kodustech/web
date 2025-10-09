import { useDefaultCodeReviewConfig } from "src/app/(app)/settings/_components/context";
import { useCodeReviewRouteParams } from "src/app/(app)/settings/_hooks";
import { FormattedConfigLevel } from "src/app/(app)/settings/code-review/_types";
import { pathToApiUrl } from "src/core/utils/helpers";
import { useSuspenseFetch } from "src/core/utils/reactQuery";
import { useOrganizationContext } from "src/features/organization/_providers/organization-context";

import { CustomMessageEntity, FormattedCustomMessageEntity } from "./types";

export const useSuspensePullRequestMessages = () => {
    const { repositoryId, directoryId } = useCodeReviewRouteParams();
    const { organizationId } = useOrganizationContext();
    const defaults = useDefaultCodeReviewConfig()?.customMessages;

    return useSuspenseFetch<FormattedCustomMessageEntity>(
        pathToApiUrl("/pull-request-messages/find-by-repository-or-directory"),
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
                    content: {
                        level: FormattedConfigLevel.DEFAULT,
                        value: defaults?.startReviewMessage?.content ?? "",
                    },
                    status: {
                        level: FormattedConfigLevel.DEFAULT,
                        value: defaults?.startReviewMessage.status ?? "active",
                    },
                },
                endReviewMessage: {
                    content: {
                        level: FormattedConfigLevel.DEFAULT,
                        value: defaults?.endReviewMessage?.content ?? "",
                    },
                    status: {
                        level: FormattedConfigLevel.DEFAULT,
                        value: defaults?.endReviewMessage?.status ?? "active",
                    },
                },
                globalSettings: {
                    hideComments: {
                        level: FormattedConfigLevel.DEFAULT,
                        value: defaults?.globalSettings?.hideComments ?? false,
                    },
                },
            },
        },
    );
};

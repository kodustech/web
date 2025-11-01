import { useDefaultCodeReviewConfig } from "src/app/(app)/settings/_components/context";
import { useCodeReviewRouteParams } from "src/app/(app)/settings/_hooks";
import { FormattedConfigLevel } from "src/app/(app)/settings/code-review/_types";
import { pathToApiUrl } from "src/core/utils/helpers";
import { useSuspenseFetch } from "src/core/utils/reactQuery";
import { useOrganizationContext } from "src/features/organization/_providers/organization-context";

import {
    CustomMessageEntity,
    FormattedCustomMessageEntity,
    PullRequestMessageStatus,
} from "./types";
import type { LiteralUnion } from "src/core/types";

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
                        value:
                            defaults?.startReviewMessage?.status ??
                            PullRequestMessageStatus.EVERY_PUSH,
                    },
                },
                endReviewMessage: {
                    content: {
                        level: FormattedConfigLevel.DEFAULT,
                        value: defaults?.endReviewMessage?.content ?? "",
                    },
                    status: {
                        level: FormattedConfigLevel.DEFAULT,
                        value:
                            defaults?.endReviewMessage?.status ??
                            PullRequestMessageStatus.EVERY_PUSH,
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

// Fetch messages for an explicit scope (useful to get parent scope value)
export const useSuspensePullRequestMessagesFor = (
    repositoryId: LiteralUnion<"global">,
    directoryId?: string,
) => {
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
                        value:
                            defaults?.startReviewMessage?.status ??
                            PullRequestMessageStatus.EVERY_PUSH,
                    },
                },
                endReviewMessage: {
                    content: {
                        level: FormattedConfigLevel.DEFAULT,
                        value: defaults?.endReviewMessage?.content ?? "",
                    },
                    status: {
                        level: FormattedConfigLevel.DEFAULT,
                        value:
                            defaults?.endReviewMessage?.status ??
                            PullRequestMessageStatus.EVERY_PUSH,
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

// Parent scope: repository <- global; directory <- repository; global has no parent
export const useSuspenseParentPullRequestMessages = () => {
    const { repositoryId, directoryId } = useCodeReviewRouteParams();

    // repository parent is global; directory parent is repository (same repo, no directory)
    const parentRepositoryId: LiteralUnion<"global"> = directoryId
        ? repositoryId
        : repositoryId === "global"
          ? "global"
          : "global";
    const parentDirectoryId: string | undefined = directoryId ? undefined : undefined;

    return useSuspensePullRequestMessagesFor(parentRepositoryId, parentDirectoryId);
};

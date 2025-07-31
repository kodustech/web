import { getOrganizationId } from "@services/organizations/fetch";
import { getPullRequestMessages } from "@services/pull-request-messages/fetch";

import type { AutomationCodeReviewConfigPageProps } from "../types";
import {
    DEFAULT_END_REVIEW_MESSAGE,
    DEFAULT_START_REVIEW_MESSAGE,
} from "./_components/options";
import { CustomMessagesTabs } from "./_components/tabs";

export const CustomMessages = async (
    props: AutomationCodeReviewConfigPageProps,
) => {
    const organizationId = await getOrganizationId();

    let pullRequestMessages = await getPullRequestMessages({
        organizationId,
        repositoryId: props.repositoryId,
    });

    pullRequestMessages ??= {
        uuid: undefined as any,
        repositoryId: props.repositoryId,
        startReviewMessage: {
            content: DEFAULT_START_REVIEW_MESSAGE,
            status: "active",
        },
        endReviewMessage: {
            content: DEFAULT_END_REVIEW_MESSAGE,
            status: "active",
        },
    };

    return (
        <CustomMessagesTabs
            messages={pullRequestMessages}
            repositoryId={props.repositoryId}
        />
    );
};

import { getOrganizationId } from "@services/organizations/fetch";
import { getPullRequestMessages } from "@services/pull-request-messages/fetch";

import type { AutomationCodeReviewConfigPageProps } from "../types";
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
        startReviewMessage: { content: "", status: "inactive" },
        endReviewMessage: { content: "", status: "inactive" },
    };

    return (
        <CustomMessagesTabs
            messages={pullRequestMessages}
            repositoryId={props.repositoryId}
        />
    );
};

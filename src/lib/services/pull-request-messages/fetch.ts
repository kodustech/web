import type { LiteralUnion } from "src/core/types";
import { axiosAuthorized } from "src/core/utils/axios";
import { pathToApiUrl } from "src/core/utils/helpers";
import { PullRequestMessageStatus } from "./types";

export const savePullRequestMessages = ({
    uuid,
    repositoryId,
    startReviewMessage,
    endReviewMessage,
    directoryId,
    globalSettings,
}: {
    uuid?: string;
    repositoryId: LiteralUnion<"global">;
    directoryId?: string;
    startReviewMessage: {
        content: string;
        status: PullRequestMessageStatus;
    };
    endReviewMessage?: {
        content: string;
        status: PullRequestMessageStatus;
    };
    globalSettings?: {
        hideComments: boolean;
        enabledLLMPrompt: boolean;
    };
}) => {
    return axiosAuthorized.post(pathToApiUrl("/pull-request-messages"), {
        uuid,
        directoryId,
        endReviewMessage,
        startReviewMessage,
        globalSettings,
        repositoryId: repositoryId === "global" ? null : repositoryId,
        configLevel:
            repositoryId === "global"
                ? "global"
                : directoryId
                  ? "directory"
                  : "repository",
    });
};

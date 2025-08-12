import type { LiteralUnion } from "src/core/types";
import { axiosAuthorized } from "src/core/utils/axios";
import { pathToApiUrl } from "src/core/utils/helpers";

export const savePullRequestMessages = ({
    uuid,
    repositoryId,
    startReviewMessage,
    endReviewMessage,
    directoryId,
}: {
    uuid?: string;
    repositoryId: LiteralUnion<"global">;
    directoryId?: string;
    startReviewMessage: {
        content: string;
        status: "active" | "inactive";
    };
    endReviewMessage?: {
        content: string;
        status: "active" | "inactive";
    };
}) => {
    return axiosAuthorized.post(pathToApiUrl("/pull-request-messages"), {
        uuid,
        directoryId,
        endReviewMessage,
        startReviewMessage,
        repositoryId: repositoryId === "global" ? null : repositoryId,
        configLevel:
            repositoryId === "global"
                ? "global"
                : directoryId
                  ? "directory"
                  : "repository",
    });
};

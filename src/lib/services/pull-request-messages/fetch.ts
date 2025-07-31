import { typedFetch } from "@services/fetch";
import type { LiteralUnion } from "src/core/types";
import { axiosAuthorized } from "src/core/utils/axios";
import { pathToApiUrl } from "src/core/utils/helpers";

export const savePullRequestMessages = ({
    uuid,
    repositoryId,
    startReviewMessage,
    endReviewMessage,
}: {
    uuid?: string;
    repositoryId: LiteralUnion<"global">;
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
        configLevel: repositoryId === "global" ? "global" : "repository",
        repositoryId: repositoryId === "global" ? null : repositoryId,
        startReviewMessage,
        endReviewMessage,
    });
};

export const getPullRequestMessages = <
    T extends {
        uuid: string;
        repositoryId: string | null;
        startReviewMessage: {
            content: string;
            status: "active" | "inactive";
        };
        endReviewMessage: {
            content: string;
            status: "active" | "inactive";
        };
    },
>(params: {
    organizationId: string;
    repositoryId: LiteralUnion<"global">;
}) =>
    typedFetch<T | undefined>(
        pathToApiUrl("/pull-request-messages/find-by-organization-id"),
        { params },
    );

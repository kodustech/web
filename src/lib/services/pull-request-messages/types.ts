import { LiteralUnion } from "src/core/types";

export type CustomMessageConfig = {
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
    globalSettings?: {
        hideComments: boolean;
    };
};

import { FormattedConfig } from "src/app/(app)/settings/code-review/_types";
import { LiteralUnion } from "src/core/types";

export type CustomMessageEntity = CustomMessageConfig & {
    uuid?: string;
    repositoryId: LiteralUnion<"global">;
    directoryId?: string;
};

export type CustomMessageConfig = {
    startReviewMessage: {
        content: string;
        status: "active" | "inactive";
    };
    endReviewMessage: {
        content: string;
        status: "active" | "inactive";
    };
    globalSettings: {
        hideComments: boolean;
    };
};

export type FormattedCustomMessageEntity = Pick<
    CustomMessageEntity,
    "uuid" | "repositoryId" | "directoryId"
> &
    FormattedCustomMessageConfig;

export type FormattedCustomMessageConfig = FormattedConfig<CustomMessageConfig>;

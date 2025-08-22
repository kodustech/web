"use client";

import { IssueSeverityLevelBadge } from "@components/system/issue-severity-level-badge";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardHeader } from "@components/ui/card";
import { Heading } from "@components/ui/heading";
import { Link } from "@components/ui/link";
import { magicModal } from "@components/ui/magic-modal";
import { Separator } from "@components/ui/separator";
import type { KodyRule } from "@services/kodyRules/types";
import { EditIcon, TrashIcon } from "lucide-react";
import { addSearchParamsToUrl } from "src/core/utils/url";

import { DeleteKodyRuleConfirmationModal } from "../../../_components/delete-confirmation-modal";
import { useCodeReviewRouteParams } from "../../../../_hooks";

export const KodyRuleItem = ({
    rule,
    onAnyChange,
}: {
    rule: KodyRule;
    onAnyChange: () => void;
}) => {
    const { repositoryId, directoryId } = useCodeReviewRouteParams();

    return (
        <Card>
            <CardHeader className="flex-row items-start justify-between gap-20">
                <div className="-mb-2 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <IssueSeverityLevelBadge severity={rule.severity} />

                        {rule.sourcePath && (
                            <Badge
                                active
                                size="xs"
                                variant="helper"
                                className="text-text-secondary min-h-auto px-3 uppercase">
                                auto-sync
                            </Badge>
                        )}
                    </div>

                    <Heading variant="h3" className="text-base">
                        {rule.title}
                    </Heading>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        href={addSearchParamsToUrl(
                            `/settings/code-review/${repositoryId}/kody-rules/${rule.uuid}`,
                            { directoryId },
                        )}>
                        <Button decorative size="icon-md" variant="secondary">
                            <EditIcon />
                        </Button>
                    </Link>

                    <Button
                        size="icon-md"
                        variant="secondary"
                        className="[--button-foreground:var(--color-danger)]"
                        onClick={() => {
                            magicModal.show(() => (
                                <DeleteKodyRuleConfirmationModal
                                    rule={rule}
                                    onSuccess={() => onAnyChange?.()}
                                />
                            ));
                        }}>
                        <TrashIcon />
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="flex flex-col gap-3">
                <Card
                    color="lv1"
                    className="text-text-secondary -mx-6 -mb-6 rounded-t-none text-sm">
                    <CardHeader>
                        <div className="flex flex-row">
                            <span className="flex-2">
                                <strong className="text-text-primary">
                                    Path:
                                </strong>{" "}
                                {rule.path || "all files (default)"}
                            </span>

                            {rule.sourcePath && (
                                <>
                                    <Separator
                                        orientation="vertical"
                                        className="bg-card-lv2 mx-4"
                                    />
                                    <span className="flex-2">
                                        <strong className="text-text-primary">
                                            Source:
                                        </strong>{" "}
                                        {rule.sourcePath ?? "./item.tsx"}
                                    </span>
                                </>
                            )}

                            <Separator
                                orientation="vertical"
                                className="bg-card-lv2 mx-4"
                            />

                            <span className="flex-1">
                                <strong className="text-text-primary">
                                    Scope:
                                </strong>{" "}
                                {rule.scope === "pull-request"
                                    ? "Pull-request"
                                    : "File"}
                            </span>
                        </div>

                        <Separator className="bg-card-lv2 my-3" />

                        <span className="text-text-secondary text-sm">
                            <strong className="text-text-primary">
                                Instructions:
                            </strong>{" "}
                            {rule.rule}
                        </span>
                    </CardHeader>
                </Card>
            </CardContent>
        </Card>
    );
};

"use client";

import { IssueSeverityLevelBadge } from "@components/system/issue-severity-level-badge";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardHeader } from "@components/ui/card";
import { Heading } from "@components/ui/heading";
import { Link } from "@components/ui/link";
import { magicModal } from "@components/ui/magic-modal";
import { Section } from "@components/ui/section";
import { Separator } from "@components/ui/separator";
import type { KodyRule } from "@services/kodyRules/types";
import { EditIcon, EyeIcon, TrashIcon } from "lucide-react";
import { addSearchParamsToUrl } from "src/core/utils/url";

import { DeleteKodyRuleConfirmationModal } from "../../../_components/delete-confirmation-modal";
import { useCodeReviewRouteParams } from "../../../../_hooks";

export const KodyRuleItem = ({
    rule,
    onAnyChange,
    canEdit,
}: {
    rule: KodyRule;
    onAnyChange: () => void;
    canEdit: boolean;
}) => {
    const { repositoryId, directoryId } = useCodeReviewRouteParams();

    return (
        <Card>
            <CardHeader className="flex-row items-start justify-between gap-10">
                <div className="-mb-2 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <IssueSeverityLevelBadge severity={rule.severity} />

                        {rule.sourcePath && (
                            <Badge
                                active
                                size="xs"
                                className="min-h-auto px-2.5 py-1">
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
                        <Button
                            decorative
                            size="icon-md"
                            variant="secondary"
                            className="size-9">
                            {canEdit ? <EditIcon /> : <EyeIcon />}
                        </Button>
                    </Link>

                    <Button
                        size="icon-md"
                        variant="secondary"
                        className="size-9 [--button-foreground:var(--color-danger)]"
                        disabled={!canEdit}
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
                    className="text-text-secondary -mx-6 -mb-6 flex-1 rounded-t-none text-sm">
                    <CardHeader>
                        <div className="flex flex-row">
                            <Section.Root className="flex-1">
                                <Section.Header>
                                    <Section.Title>Path:</Section.Title>
                                </Section.Header>

                                <Section.Content>
                                    {rule.path || "all files (default)"}
                                </Section.Content>
                            </Section.Root>

                            {rule.sourcePath && (
                                <>
                                    <Separator
                                        orientation="vertical"
                                        className="bg-card-lv2 mx-4"
                                    />

                                    <Section.Root className="flex-1">
                                        <Section.Header>
                                            <Section.Title>
                                                Source:
                                            </Section.Title>
                                        </Section.Header>

                                        <Section.Content>
                                            {rule.sourcePath}
                                        </Section.Content>
                                    </Section.Root>
                                </>
                            )}

                            <Separator
                                orientation="vertical"
                                className="bg-card-lv2 mx-4"
                            />

                            <Section.Root className="flex-1 shrink">
                                <Section.Header>
                                    <Section.Title>Scope:</Section.Title>
                                </Section.Header>

                                <Section.Content>
                                    {rule.scope === "pull-request"
                                        ? "Pull-request"
                                        : "File"}
                                </Section.Content>
                            </Section.Root>
                        </div>

                        <Separator className="bg-card-lv2 my-3" />

                        <Section.Root>
                            <Section.Header>
                                <Section.Title>Instructions:</Section.Title>
                            </Section.Header>

                            <Section.Content className="line-clamp-3">
                                {rule.rule}
                            </Section.Content>
                        </Section.Root>
                    </CardHeader>
                </Card>
            </CardContent>
        </Card>
    );
};

"use client";

import { IssueSeverityLevelBadge } from "@components/system/issue-severity-level-badge";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@components/ui/card";
import { Heading } from "@components/ui/heading";
import { Link } from "@components/ui/link";
import { magicModal } from "@components/ui/magic-modal";
import { Section } from "@components/ui/section";
import { Separator } from "@components/ui/separator";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@components/ui/tooltip";
import { Callout } from "@radix-ui/themes";
import type { KodyRuleWithInheritanceDetails } from "@services/kodyRules/types";
import { usePermission } from "@services/permissions/hooks";
import { Action, ResourceType } from "@services/permissions/types";
import { EditIcon, EyeIcon, InfoIcon, TrashIcon } from "lucide-react";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";
import { cn } from "src/core/utils/components";
import { addSearchParamsToUrl } from "src/core/utils/url";

import { DeleteKodyRuleConfirmationModal } from "../../../_components/delete-confirmation-modal";
import { useCodeReviewRouteParams } from "../../../../_hooks";

export const KodyRuleItem = ({
    rule,
    onAnyChange,
}: {
    rule: KodyRuleWithInheritanceDetails;
    onAnyChange: () => void;
}) => {
    const { repositoryId, directoryId } = useCodeReviewRouteParams();
    const { teamId } = useSelectedTeamId();
    const canEdit = usePermission(
        Action.Update,
        ResourceType.KodyRules,
        repositoryId,
    );
    const canDelete = usePermission(
        Action.Delete,
        ResourceType.KodyRules,
        repositoryId,
    );

    const isInherited = !!rule.inherited;
    const isExcluded = isInherited && !!rule.excluded;

    console.log(rule);

    return (
        <Card>
            <CardHeader className="flex-row items-start justify-between gap-10">
                <div className="-mb-2 flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <IssueSeverityLevelBadge severity={rule.severity} />

                        {rule.sourcePath && (
                            <Badge
                                active
                                size="xs"
                                className="min-h-auto px-2.5 py-1">
                                auto-sync
                            </Badge>
                        )}

                        {isInherited && (
                            <Tooltip delayDuration={500}>
                                <TooltipTrigger>
                                    <Badge
                                        active
                                        size="xs"
                                        className="bg-muted/10 text-muted ring-muted/64 pointer-events-none h-6 min-h-auto rounded-lg px-2 text-[10px] leading-px uppercase ring-1 [--button-foreground:var(--color-muted)]">
                                        Inherited: {rule.inherited}
                                    </Badge>
                                </TooltipTrigger>

                                <TooltipContent>
                                    <p>
                                        This rule is inherited and cannot be
                                        edited or deleted here.
                                    </p>
                                    <p>
                                        Click the eye icon to view its details
                                        or to disable it for this scope.
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        )}

                        {isExcluded && (
                            <Tooltip delayDuration={500}>
                                <TooltipTrigger>
                                    <Badge
                                        active
                                        size="xs"
                                        className="bg-muted/10 text-muted ring-muted/64 pointer-events-none h-6 min-h-auto rounded-lg px-2 text-[10px] leading-px uppercase ring-1 [--button-foreground:var(--color-muted)]">
                                        Disabled
                                    </Badge>
                                </TooltipTrigger>

                                <TooltipContent>
                                    <p>
                                        This rule is inherited but disabled for
                                        this scope.
                                    </p>
                                    <p>
                                        Click the eye icon to view its details
                                        or to enable it for this scope.
                                    </p>
                                </TooltipContent>
                            </Tooltip>
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
                            { directoryId, teamId },
                        )}>
                        <Button
                            decorative
                            size="icon-md"
                            variant="secondary"
                            className="size-9">
                            {!canEdit || isInherited ? (
                                <EyeIcon />
                            ) : (
                                <EditIcon />
                            )}
                        </Button>
                    </Link>

                    <Button
                        size="icon-md"
                        variant="secondary"
                        className="size-9 [--button-foreground:var(--color-danger)]"
                        disabled={!canDelete || isInherited}
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
                    <CardFooter>
                        {rule.syncError && (
                            <div className="text-text-secondary flex w-full items-center gap-2 rounded-lg bg-red-500/10 p-2 text-sm">
                                <InfoIcon className="size-4 flex-shrink-0" />
                                <span className="text-text-secondary text-xs">
                                    {rule.syncError}
                                </span>
                            </div>
                        )}
                    </CardFooter>
                </Card>
            </CardContent>
        </Card>
    );
};

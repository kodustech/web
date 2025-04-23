"use client";

import { Badge } from "@components/ui/badge";
import { CardContent, CardFooter, CardHeader } from "@components/ui/card";
import { Heading } from "@components/ui/heading";
import { magicModal } from "@components/ui/magic-modal";
import type { KodyRule, LibraryRule } from "@services/kodyRules/types";
import { ProgrammingLanguage } from "src/core/enums/programming-language";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";
import { cn } from "src/core/utils/components";

import { Button } from "../button";
import { KodyRuleLibraryItemModal } from "./library-item-modal";

const severityVariantMap = {
    Critical: "bg-danger/10 text-danger border-danger/64",
    High: "bg-warning/10 text-warning border-warning/64",
    Medium: "bg-alert/10 text-alert border-alert/64",
    Low: "bg-info/10 text-info border-info/64",
} as const satisfies Record<string, string>;

export const KodyRuleLibraryItem = ({
    rule,
    repositoryId,
    onAddRule,
    selectedRepositories,
}: {
    rule: LibraryRule;
    repositoryId?: string;
    onAddRule?: (rules: KodyRule[]) => void;
    selectedRepositories?: Array<{
        id: string;
        name: string;
        isSelected?: boolean;
    }>;
}) => {
    const { teamId } = useSelectedTeamId();

    return (
        <Button
            size={null}
            variant="helper"
            key={rule.uuid}
            className="flex w-full flex-col items-start gap-2"
            onClick={() => {
                magicModal.show(() => (
                    <KodyRuleLibraryItemModal
                        rule={rule}
                        repositoryId={repositoryId}
                        teamId={teamId}
                        onAddRule={onAddRule}
                        selectedRepositories={selectedRepositories}
                    />
                ));
            }}>
            <CardHeader className="flex-row justify-between gap-4">
                <Heading
                    variant="h3"
                    className="line-clamp-2 flex min-h-6 items-center font-semibold">
                    {rule.title}
                </Heading>

                <Badge
                    className={cn(
                        "h-fit rounded-lg border-1 px-2 text-[10px] leading-px uppercase",
                        severityVariantMap[
                            rule.severity as typeof rule.severity
                        ],
                    )}>
                    {rule.severity}
                </Badge>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col">
                <p className="text-text-secondary line-clamp-3 text-[13px]">
                    {rule.rule}
                </p>
            </CardContent>

            <CardFooter className="flex flex-wrap gap-1">
                {rule.language && (
                    <Badge>{ProgrammingLanguage[rule.language]}</Badge>
                )}

                {rule.tags.map((tag) => (
                    <Badge key={tag}>{tag}</Badge>
                ))}
            </CardFooter>
        </Button>
    );
};

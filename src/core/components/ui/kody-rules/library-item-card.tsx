"use client";

import { Badge } from "@components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@components/ui/card";
import { Heading } from "@components/ui/heading";
import { magicModal } from "@components/ui/magic-modal";
import type { KodyRule, LibraryRule } from "@services/kodyRules/types";
import { ProgrammingLanguage } from "src/core/enums/programming-language";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";
import { cn } from "src/core/utils/components";

import { KodyRuleLibraryItemModal } from "./library-item-modal";

const severityVariantMap = {
    Critical: "!bg-destructive/5 border-destructive/10 text-destructive",
    High: "!bg-brand-purple/5 border-brand-purple/10 text-brand-purple",
    Medium: "!bg-brand-orange/5 border-brand-orange/10 text-brand-orange",
    Low: "!bg-success/5 border-success/10 text-success",
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
    selectedRepositories?: Array<{ id: string; name: string; isSelected?: boolean }>;
}) => {
    const { teamId } = useSelectedTeamId();

    return (
        <Card
            key={rule.uuid}
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
            }}
            className={cn("cursor-pointer transition-colors hover:bg-card")}>
            <CardHeader className="flex-row justify-between gap-4">
                <Heading variant="h3" className="line-clamp-2 font-semibold">
                    {rule.title}
                </Heading>

                <Badge
                    disabled
                    variant="outline"
                    className={cn(
                        "h-6 !cursor-default px-2.5 text-[10px] uppercase !opacity-100",
                        severityVariantMap[
                        rule.severity as typeof rule.severity
                        ],
                    )}>
                    {rule.severity}
                </Badge>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col">
                <p className="line-clamp-3 text-[13px] text-muted-foreground">
                    {rule.rule}
                </p>
            </CardContent>

            <CardFooter className="flex flex-wrap gap-1">
                {rule.language && (
                    <Badge
                        disabled
                        variant="outline"
                        className="!cursor-default text-xs !opacity-100">
                        {ProgrammingLanguage[rule.language]}
                    </Badge>
                )}

                {rule.tags.map((tag) => (
                    <Badge
                        disabled
                        key={tag}
                        variant="outline"
                        className="!cursor-default text-xs text-muted-foreground !opacity-100">
                        {tag}
                    </Badge>
                ))}
            </CardFooter>
        </Card>
    );
};

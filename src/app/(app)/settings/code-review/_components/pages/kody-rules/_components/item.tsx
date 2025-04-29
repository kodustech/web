import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Card, CardHeader } from "@components/ui/card";
import { Heading } from "@components/ui/heading";
import { magicModal } from "@components/ui/magic-modal";
import { useAsyncAction } from "@hooks/use-async-action";
import { deleteKodyRule } from "@services/kodyRules/fetch";
import type { KodyRule } from "@services/kodyRules/types";
import { EditIcon, TrashIcon } from "lucide-react";
import { cn } from "src/core/utils/components";

import { KodyRuleAddOrUpdateItemModal } from "./modal";

const severityVariantMap = {
    critical: "bg-danger/10 text-danger border-danger/64",
    high: "bg-warning/10 text-warning border-warning/64",
    medium: "bg-alert/10 text-alert border-alert/64",
    low: "bg-info/10 text-info border-info/64",
} as const satisfies Record<string, string>;

type Props = {
    rule: KodyRule;
    repositoryId: string;
    onAnyChange: () => void;
};

export const KodyRuleItem = ({ repositoryId, rule, onAnyChange }: Props) => {
    const [deleteRule, { loading: deletingRule }] = useAsyncAction(async () => {
        await deleteKodyRule(rule.uuid!);
        onAnyChange?.();
    });

    return (
        <Card>
            <CardHeader className="flex-row items-start justify-between gap-10">
                <div className="flex flex-col gap-2">
                    <Heading variant="h3">{rule.title}</Heading>

                    <div className="flex flex-col gap-1">
                        <span className="text-text-secondary text-sm">
                            <strong className="text-text-primary">Path:</strong>{" "}
                            {rule.path || "all files (default)"}
                        </span>

                        <span className="text-text-secondary text-sm">
                            <strong className="text-text-primary">
                                Instructions:
                            </strong>{" "}
                            {rule.rule}
                        </span>
                    </div>

                    <Badge
                        className={cn(
                            severityVariantMap[
                                rule.severity as keyof typeof severityVariantMap
                            ],
                        )}>
                        {rule.severity}
                    </Badge>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        size="icon-md"
                        variant="secondary"
                        onClick={async () => {
                            const response = await magicModal.show(() => (
                                <KodyRuleAddOrUpdateItemModal
                                    rule={rule}
                                    repositoryId={repositoryId}
                                />
                            ));

                            if (!response) return;
                            onAnyChange?.();
                        }}>
                        <EditIcon className="size-4" />
                    </Button>

                    <Button
                        size="icon-md"
                        variant="secondary"
                        loading={deletingRule}
                        onClick={deleteRule}
                        className="[--button-foreground:var(--color-danger)]">
                        <TrashIcon />
                    </Button>
                </div>
            </CardHeader>
        </Card>
    );
};

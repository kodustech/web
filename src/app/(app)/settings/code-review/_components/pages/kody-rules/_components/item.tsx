import { useRouter } from "next/navigation";
import { IssueSeverityLevelBadge } from "@components/system/issue-severity-level-badge";
import { Button } from "@components/ui/button";
import { Card, CardHeader } from "@components/ui/card";
import { Heading } from "@components/ui/heading";
import { useAsyncAction } from "@hooks/use-async-action";
import { deleteKodyRule } from "@services/kodyRules/fetch";
import type { KodyRule } from "@services/kodyRules/types";
import { EditIcon, TrashIcon } from "lucide-react";

type Props = {
    rule: KodyRule;
    repositoryId: string;
    onAnyChange: () => void;
};

export const KodyRuleItem = ({ repositoryId, rule, onAnyChange }: Props) => {
    const router = useRouter();
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

                    <IssueSeverityLevelBadge severity={rule.severity} />
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        size="icon-md"
                        variant="secondary"
                        onClick={() => {
                            console.log("Button clicked!", {
                                repositoryId,
                                ruleId: rule.uuid,
                            });
                            // Igual à library - simplesmente navegar
                            router.push(
                                `/settings/code-review/${repositoryId}/kody-rules/${rule.uuid}`,
                            );
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

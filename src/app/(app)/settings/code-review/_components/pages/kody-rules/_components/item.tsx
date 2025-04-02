import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Card, CardHeader } from "@components/ui/card";
import { Heading } from "@components/ui/heading";
import { magicModal } from "@components/ui/magic-modal";
import { useAsyncAction } from "@hooks/use-async-action";
import { deleteKodyRule } from "@services/kodyRules/fetch";
import type { KodyRule } from "@services/kodyRules/types";
import { EditIcon, TrashIcon } from "lucide-react";

import { KodyRuleAddOrUpdateItemModal } from "./modal";

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
                        <span className="text-sm text-muted-foreground">
                            <strong className="text-foreground">Path:</strong>{" "}
                            {rule.path || "all files (default)"}
                        </span>

                        <span className="text-sm text-muted-foreground">
                            <strong className="text-foreground">
                                Instructions:
                            </strong>{" "}
                            {rule.rule}
                        </span>
                    </div>

                    <Badge variant="outline" className="pointer-events-none">
                        {rule.severity}
                    </Badge>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        size="icon"
                        variant="outline"
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
                        size="icon"
                        variant="outline"
                        loading={deletingRule}
                        onClick={deleteRule}>
                        <TrashIcon className="size-4 text-destructive" />
                    </Button>
                </div>
            </CardHeader>
        </Card>
    );
};

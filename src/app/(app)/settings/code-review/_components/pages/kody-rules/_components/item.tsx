import { useRouter } from "next/navigation";
import { IssueSeverityLevelBadge } from "@components/system/issue-severity-level-badge";
import { Button } from "@components/ui/button";
import { Card, CardHeader } from "@components/ui/card";
import { Heading } from "@components/ui/heading";
import { magicModal } from "@components/ui/magic-modal";
import type { KodyRule } from "@services/kodyRules/types";
import { EditIcon, TrashIcon } from "lucide-react";

import { DeleteKodyRuleConfirmationModal } from "./delete-confirmation-modal";

type Props = {
    rule: KodyRule;
    repositoryId: string;
    onAnyChange: () => void;
};

export const KodyRuleItem = ({ repositoryId, rule, onAnyChange }: Props) => {
    const router = useRouter();

    const handleDeleteClick = () => {
        magicModal.show(() => (
            <DeleteKodyRuleConfirmationModal
                rule={rule}
                onSuccess={() => {
                    onAnyChange?.();
                }}
            />
        ));
    };

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
                            router.push(
                                `/settings/code-review/${repositoryId}/kody-rules/${rule.uuid}`,
                            );
                        }}>
                        <EditIcon className="size-4" />
                    </Button>

                    <Button
                        size="icon-md"
                        variant="secondary"
                        onClick={handleDeleteClick}
                        className="[--button-foreground:var(--color-danger)]">
                        <TrashIcon />
                    </Button>
                </div>
            </CardHeader>
        </Card>
    );
};

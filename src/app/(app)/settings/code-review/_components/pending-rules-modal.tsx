import { useState } from "react";
import { IssueSeverityLevelBadge } from "@components/system/issue-severity-level-badge";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardHeader } from "@components/ui/card";
import { Checkbox } from "@components/ui/checkbox";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleIndicator,
    CollapsibleTrigger,
} from "@components/ui/collapsible";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@components/ui/dialog";
import { Label } from "@components/ui/label";
import { magicModal } from "@components/ui/magic-modal";
import { Markdown } from "@components/ui/markdown";
import { changeStatusKodyRules } from "@services/kodyRules/fetch";
import { KodyRule, KodyRulesStatus } from "@services/kodyRules/types";
import { pluralize } from "src/core/utils/string";

export const PendingKodyRulesModal = ({
    pendingRules,
}: {
    pendingRules: KodyRule[];
}) => {
    const [selectedRuleIds, setSelectedRuleIds] = useState<string[]>([]);

    const changeStatusRules = async (status: KodyRulesStatus) => {
        magicModal.lock();

        await changeStatusKodyRules(selectedRuleIds, status);

        magicModal.hide(true);
    };

    return (
        <Dialog open onOpenChange={() => magicModal.hide()}>
            <DialogContent className="max-h-[80vh] max-w-(--breakpoint-md)">
                <DialogHeader>
                    <DialogTitle>New Rules Ready</DialogTitle>

                    <DialogDescription>
                        Kody analyzed your past reviews and generated these
                        rules:
                    </DialogDescription>
                </DialogHeader>

                <div className="flex w-full flex-col gap-2">
                    {pendingRules?.map((rule) => (
                        <Card key={rule.uuid}>
                            <Collapsible className="w-full">
                                <CardHeader className="flex flex-row items-center gap-3 px-5 py-4">
                                    <Checkbox
                                        id={rule.uuid}
                                        className="flex-shrink-0 self-center"
                                        checked={selectedRuleIds.includes(
                                            rule.uuid!,
                                        )}
                                        onClick={() => {
                                            selectedRuleIds.includes(rule.uuid!)
                                                ? setSelectedRuleIds(
                                                      selectedRuleIds.filter(
                                                          (id) =>
                                                              id !== rule.uuid,
                                                      ),
                                                  )
                                                : setSelectedRuleIds([
                                                      ...selectedRuleIds,
                                                      rule.uuid!,
                                                  ]);
                                        }}
                                    />

                                    <Label
                                        htmlFor={rule.uuid}
                                        className="flex-1">
                                        {rule.title}
                                    </Label>

                                    <div className="flex items-center gap-3">
                                        <IssueSeverityLevelBadge
                                            severity={rule.severity}
                                        />

                                        <CollapsibleTrigger asChild>
                                            <Button
                                                active
                                                size="icon-sm"
                                                variant="helper">
                                                <CollapsibleIndicator />
                                            </Button>
                                        </CollapsibleTrigger>
                                    </div>
                                </CardHeader>

                                <CollapsibleContent asChild className="pb-0">
                                    <CardContent className="bg-card-lv1 flex flex-col gap-5 pt-4">
                                        <Markdown>{rule.rule}</Markdown>
                                    </CardContent>
                                </CollapsibleContent>
                            </Collapsible>
                        </Card>
                    ))}
                </div>

                <DialogFooter className="flex flex-row justify-end gap-2">
                    {pendingRules.length === 0 ? (
                        <div />
                    ) : (
                        <div className="mr-auto flex items-center gap-4">
                            {selectedRuleIds.length < pendingRules.length ? (
                                <Button
                                    size="md"
                                    variant="helper"
                                    onClick={() =>
                                        setSelectedRuleIds(
                                            pendingRules.map((r) => r.uuid!),
                                        )
                                    }>
                                    Select all
                                </Button>
                            ) : (
                                <Button
                                    size="md"
                                    variant="helper"
                                    onClick={() => setSelectedRuleIds([])}>
                                    Unselect all
                                </Button>
                            )}

                            <span className="text-text-secondary text-sm">
                                <strong className="text-text-primary">
                                    {selectedRuleIds.length}
                                </strong>{" "}
                                {pluralize(selectedRuleIds.length, {
                                    plural: "rules",
                                    singular: "rule",
                                })}{" "}
                                selected
                            </span>
                        </div>
                    )}

                    <Button
                        size="md"
                        variant="cancel"
                        onClick={magicModal.hide}>
                        Cancel
                    </Button>

                    <Button
                        size="md"
                        variant="primary"
                        disabled={selectedRuleIds.length === 0}
                        onClick={() =>
                            changeStatusRules(KodyRulesStatus.ACTIVE)
                        }>
                        Import rules
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

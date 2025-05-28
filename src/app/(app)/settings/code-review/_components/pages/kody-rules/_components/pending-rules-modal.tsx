import { useState } from "react";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
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
import { Heading } from "@components/ui/heading";
import { magicModal } from "@components/ui/magic-modal";
import { changeStatusKodyRules } from "@services/kodyRules/fetch";
import { KodyRule, KodyRulesStatus } from "@services/kodyRules/types";
import { cn } from "src/core/utils/components";

const severityVariantMap = {
    critical: "bg-danger/10 text-danger border-danger/64",
    high: "bg-warning/10 text-warning border-warning/64",
    medium: "bg-alert/10 text-alert border-alert/64",
    low: "bg-info/10 text-info border-info/64",
} as const satisfies Record<string, string>;

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

    // if (!pendingRules || pendingRules.length === 0) {
    //     return <NoRules />;
    // }

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

                <span className="text-text-secondary text-sm">
                    <strong className="text-text-primary">
                        {selectedRuleIds.length}
                    </strong>{" "}
                    rules selected
                </span>

                <div className="flex h-full w-full flex-col gap-2 overflow-y-auto px-2 py-0">
                    <div className="flex h-full w-full flex-col gap-2 px-2 py-0">
                        {pendingRules?.map((rule) => (
                            <Card
                                key={rule.uuid}
                                className={cn(
                                    "h-auto w-full cursor-pointer items-start px-5 py-4 disabled:cursor-not-allowed",
                                )}>
                                <Collapsible className="group/collapsible w-full">
                                    <div className="flex w-full items-center gap-3 overflow-hidden">
                                        <Checkbox
                                            className="children:opacity-100 self-center disabled:opacity-100 flex-shrink-0"
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

                                        <Heading
                                            variant="h3"
                                            className="w-full truncate">
                                            {rule.title}
                                        </Heading>

                                        <CollapsibleTrigger asChild>
                                            <Button
                                                size="sm"
                                                variant="helper"
                                                className="w-full justify-center p-3"
                                                leftIcon={
                                                    <CollapsibleIndicator className="group-data-[state=closed]/collapsible:rotate-[-90deg] group-data-[state=open]/collapsible:rotate-0" />
                                                }
                                            />
                                        </CollapsibleTrigger>
                                    </div>

                                    <CollapsibleContent className="group-data-[state=closed]/collapsible:animate-collapsible-up group-data-[state=open]/collapsible:animate-collapsible-down">
                                        <div className="flex flex-col gap-5 pt-3">
                                            <p>{rule.rule}</p>

                                            <Badge
                                                className={cn(
                                                    "h-fit rounded-lg border-1 px-2 text-[10px] leading-px uppercase",
                                                    severityVariantMap[
                                                    rule.severity.toLowerCase() as typeof rule.severity
                                                    ],
                                                )}>
                                                {rule.severity}
                                            </Badge>
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>
                            </Card>
                        ))}
                    </div>
                </div>

                <DialogFooter className="flex flex-row justify-end gap-2">
                    {pendingRules.length === 0 ? (
                        <div />
                    ) : (
                        <>
                            {selectedRuleIds.length < pendingRules.length ? (
                                <Button
                                    size="md"
                                    variant="helper"
                                    className="mr-auto"
                                    onClick={() =>
                                        setSelectedRuleIds(
                                            pendingRules.map(
                                                (rule) => rule.uuid!,
                                            ),
                                        )
                                    }>
                                    Select all
                                </Button>
                            ) : (
                                <Button
                                    size="md"
                                    variant="helper"
                                    className="mr-auto"
                                    onClick={() => setSelectedRuleIds([])}>
                                    Unselect all
                                </Button>
                            )}
                        </>
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

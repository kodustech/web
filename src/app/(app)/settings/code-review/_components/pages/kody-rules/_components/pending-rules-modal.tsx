import { useState } from "react";
import { Badge } from "@components/ui/badge";
import { Button, buttonVariants } from "@components/ui/button";
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
import { Separator } from "@components/ui/separator";
import { changeStatusKodyRules } from "@services/kodyRules/fetch";
import { KodyRule, KodyRulesStatus } from "@services/kodyRules/types";
import { cn } from "src/core/utils/components";

const severityVariantMap = {
    critical: "!bg-destructive/5 border-destructive/10 text-destructive",
    high: "!bg-brand-purple/5 border-brand-purple/10 text-brand-purple",
    medium: "!bg-brand-orange/5 border-brand-orange/10 text-brand-orange",
    low: "!bg-success/5 border-success/10 text-success",
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

    if (!pendingRules || pendingRules.length === 0) {
        return <NoRules />;
    }

    return (
        <Dialog open onOpenChange={() => magicModal.hide()}>
            <DialogContent className="max-h-[60vh] max-w-screen-sm">
                <DialogHeader>
                    <DialogTitle>New Rules Ready</DialogTitle>

                    <Separator />

                    <DialogDescription>
                        Kody analyzed your past reviews and generated these
                        rules:
                    </DialogDescription>
                </DialogHeader>
                <span>{selectedRuleIds.length} rules selected.</span>

                <div className="flex h-full w-full flex-col gap-2 overflow-y-auto px-2 py-0">
                    {pendingRules?.map((rule) => (
                        <Card
                            key={rule.uuid}
                            className={cn(
                                buttonVariants({
                                    variant: "outline",
                                }),
                                "h-auto w-full cursor-pointer items-start px-5 py-4 disabled:cursor-not-allowed",
                            )}>
                            <Collapsible className="group/collapsible w-full">
                                <div className="flex h-full w-full items-center gap-5">
                                    <Checkbox
                                        className="self-center children:opacity-100 disabled:opacity-100"
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
                                            variant="ghost"
                                            selected={true}
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
                                            disabled
                                            variant="outline"
                                            className={cn(
                                                "h-6 !cursor-default px-2.5 text-[10px] uppercase !opacity-100",
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

                <DialogFooter className="flex flex-row justify-end gap-2">
                    {selectedRuleIds.length < pendingRules.length ? (
                        <Button
                            className="mr-auto"
                            variant="outline"
                            onClick={() =>
                                setSelectedRuleIds(
                                    pendingRules.map((rule) => rule.uuid!),
                                )
                            }>
                            Select all
                        </Button>
                    ) : (
                        <Button
                            className="mr-auto"
                            variant="outline"
                            onClick={() => setSelectedRuleIds([])}>
                            Unselect all
                        </Button>
                    )}
                    <Button variant="outline" onClick={magicModal.hide}>
                        Cancel
                    </Button>
                    <Button
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

const NoRules = () => {
    return (
        <Dialog open onOpenChange={() => magicModal.hide()}>
            <DialogContent className="max-h-[60vh] max-w-screen-sm">
                <DialogHeader>
                    <DialogTitle>New Rules Ready</DialogTitle>
                    <Separator />
                </DialogHeader>

                <div className="flex flex-col gap-2 overflow-y-auto px-2 py-0">
                    <Heading variant="h3">No pending rules</Heading>
                </div>
            </DialogContent>
        </Dialog>
    );
};

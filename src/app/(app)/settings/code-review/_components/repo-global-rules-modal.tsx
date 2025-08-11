import { Card, CardHeader } from "@components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@components/ui/dialog";
import { magicModal } from "@components/ui/magic-modal";
import { KodyRule } from "@services/kodyRules/types";

export const KodyRulesRepoFollowsGlobalRulesModal = ({
    globalRules,
}: {
    globalRules: KodyRule[];
}) => {
    return (
        <Dialog open onOpenChange={() => magicModal.hide()}>
            <DialogContent className="max-h-[60vh]">
                <DialogHeader>
                    <DialogTitle>Rules inherited from Global</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-2">
                    {globalRules?.length === 0 ? (
                        <span className="text-sm">
                            There are no rules to be inherited. You can
                            configure globally or here for this repository.
                        </span>
                    ) : (
                        globalRules?.map((rule) => (
                            <Card key={rule.uuid}>
                                <CardHeader className="py-4">
                                    <p className="text-text-secondary truncate text-sm">
                                        {rule.title}
                                    </p>
                                </CardHeader>
                            </Card>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

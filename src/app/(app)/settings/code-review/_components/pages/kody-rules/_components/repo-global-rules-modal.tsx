import { useRouter } from "next/navigation";
import { Card, CardHeader } from "@components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@components/ui/dialog";
import { Heading } from "@components/ui/heading";
import { magicModal } from "@components/ui/magic-modal";
import { Page } from "@components/ui/page";
import { Separator } from "@components/ui/separator";
import { KodyRule } from "@services/kodyRules/types";

export const KodyRulesRepoFollowsGlobalRulesModal = ({
    globalRules,
}: {
    globalRules: KodyRule[];
}) => {
    const router = useRouter();

    return (
        <Dialog open onOpenChange={() => magicModal.hide()}>
            <DialogContent className="max-h-[60vh] max-w-screen-sm">
                <DialogHeader>
                    <DialogTitle>Rules inherited from Global:</DialogTitle>
                    <Separator />
                </DialogHeader>

                <Page.Root className="p-0">
                    <Page.Content className="flex flex-col gap-2 px-2 py-0">
                        {globalRules?.length === 0 ? (
                            <Heading variant="h3">
                                There are no rules to be inherited. You can
                                configure globally or here for this repository
                            </Heading>
                        ) : (
                            globalRules?.map((rule) => (
                                <Card key={rule.uuid} className="rounded-xl">
                                    <CardHeader className="flex-row items-start justify-between gap-10 p-3">
                                        <p className="truncate text-sm text-muted-foreground">
                                            {rule.title}
                                        </p>
                                    </CardHeader>
                                </Card>
                            ))
                        )}
                    </Page.Content>
                </Page.Root>
            </DialogContent>
        </Dialog>
    );
};

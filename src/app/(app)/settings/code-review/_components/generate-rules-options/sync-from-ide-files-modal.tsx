import { Button } from "@components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@components/ui/dialog";
import { magicModal } from "@components/ui/magic-modal";
import { toast } from "@components/ui/toaster/use-toast";
import { useEffectOnce } from "@hooks/use-effect-once";
import { ClockFadingIcon, RefreshCwIcon } from "lucide-react";

export const SyncFromIDEFilesFirstTimeModal = () => {
    useEffectOnce(() => magicModal.lock());

    return (
        <Dialog open onOpenChange={() => magicModal.hide()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Sync repository rules now?</DialogTitle>

                    <DialogDescription>
                        Kody will look for rule files in this repo and import
                        them into Kody Rules.
                    </DialogDescription>
                </DialogHeader>

                <div className="text-text-secondary text-sm">
                    <span>What happens:</span>

                    <ul className="list-disc pl-5">
                        <li>
                            Scan the repo for rule files{" "}
                            <code className="bg-card-lv1 text-text-primary mx-0.5 rounded-lg px-1.5 py-0.5">
                                (e.g. .cursorrules, CLAUDE.md)
                            </code>
                        </li>
                        <li>
                            Import any of these files found into your workspace
                        </li>
                        <li>Keep them in sync from now on</li>
                    </ul>
                </div>

                <DialogFooter>
                    <Button
                        size="md"
                        variant="secondary"
                        leftIcon={<ClockFadingIcon />}
                        onClick={() => magicModal.hide()}>
                        Skip initial scan
                    </Button>

                    <Button
                        size="md"
                        variant="primary"
                        leftIcon={<RefreshCwIcon />}
                        onClick={() => {
                            toast({
                                variant: "info",
                                title: "We're searching your repository for rules files",
                                description: (
                                    <>
                                        <p>This may take a few minutes.</p>
                                        <p>
                                            Generated rules will be listed in
                                            this page.
                                        </p>
                                    </>
                                ),
                            });

                            magicModal.hide(true);
                        }}>
                        Sync now
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

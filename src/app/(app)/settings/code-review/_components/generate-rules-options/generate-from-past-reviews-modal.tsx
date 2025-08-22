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
import { ClockFadingIcon, GitPullRequestIcon } from "lucide-react";

export const GenerateFromPastReviewsFirstTimeModal = () => {
    useEffectOnce(() => magicModal.lock());

    return (
        <Dialog open onOpenChange={() => magicModal.hide()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Generate rules from past reviews now?
                    </DialogTitle>

                    <DialogDescription>
                        Kody will analyze closed PRs from the last 3 months to
                        suggest draft rules.
                    </DialogDescription>
                </DialogHeader>

                <div className="text-text-secondary text-sm">
                    <span>What happens:</span>

                    <ul className="list-disc pl-5">
                        <li>Review patterns from past pull requests</li>
                        <li>Suggest draft rules you can edit or approve</li>
                        <li>Keep generating from future PRs automatically</li>
                    </ul>
                </div>

                <DialogFooter>
                    <Button
                        size="md"
                        variant="secondary"
                        leftIcon={<ClockFadingIcon />}
                        onClick={() => magicModal.hide()}>
                        Start from next PR
                    </Button>

                    <Button
                        size="md"
                        variant="primary"
                        leftIcon={<GitPullRequestIcon />}
                        onClick={() => {
                            toast({
                                variant: "info",
                                title: "We're analyzing your past PRs",
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
                        Analyze past PRs
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

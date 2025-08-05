import { Button } from "@components/ui/button";
import { Heading } from "@components/ui/heading";
import { Markdown } from "@components/ui/markdown";
import type { useSuspenseGetOnboardingPullRequests } from "@services/codeManagement/hooks";
import { RotateCcwIcon } from "lucide-react";

type PullRequest = Awaited<
    ReturnType<typeof useSuspenseGetOnboardingPullRequests>
>[number];

export const PRSummaryPreviewResult = (props: {
    onResetState: () => void;
    selectedPR: PullRequest;
    previewResult: string;
}) => {
    return (
        <div className="-mx-6 -mb-6 flex flex-1 flex-col overflow-y-auto">
            <div className="flex flex-shrink-0 items-end justify-between px-6">
                <Heading variant="h3" className="text-base">
                    Preview for PR{" "}
                    <span className="text-primary-light">
                        #{props.selectedPR.pull_number}
                    </span>
                    {props.selectedPR && (
                        <span className="text-text-secondary ml-1">
                            from{" "}
                            <span className="text-primary-light">
                                {props.selectedPR.repository}
                            </span>
                        </span>
                    )}
                </Heading>

                <Button
                    size="sm"
                    variant="helper"
                    leftIcon={<RotateCcwIcon />}
                    onClick={() => props.onResetState()}>
                    Generate Another
                </Button>
            </div>

            <div className="bg-card-lv1 border-card-lv2 mt-3 flex-1 overflow-auto rounded-b-lg border-t p-6">
                <Markdown>{props.previewResult}</Markdown>
            </div>
        </div>
    );
};

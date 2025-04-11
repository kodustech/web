import { useAsyncAction } from "@hooks/use-async-action";
import { finishOnboarding } from "@services/codeManagement/fetch";
import { captureSegmentEvent } from "src/core/utils/segment";
import { isSelfHosted } from "src/core/utils/self-hosted";

import { startTeamTrial } from "../../subscription/_services/billing/fetch";

type SelectedPR = {
    id: string;
    pull_number: number;
    repository: string;
    title: string;
    url: string;
};

export const useFinishOnboardingReviewingPR = ({
    teamId,
    userId,
    organizationId,
    onSuccess,
}: {
    teamId: string;
    userId: string;
    organizationId: string;
    onSuccess: () => void;
}) => {
    const [
        finishOnboardingReviewingPR,
        { loading: isFinishingOnboardingReviewingPR },
    ] = useAsyncAction(async (selectedPR: SelectedPR | undefined) => {
        if (!selectedPR) return;

        finishOnboarding({
            teamId,
            reviewPR: true,
            repositoryId: selectedPR.id,
            repositoryName: selectedPR.repository,
            pullNumber: selectedPR.pull_number,
        });

        captureSegmentEvent({
            userId: userId!,
            event: "first_review",
            properties: { teamId },
        });

        if (!isSelfHosted) {
            await startTeamTrial({ teamId, organizationId });
        }

        onSuccess();

        await new Promise((resolve) => setTimeout(resolve, 5000));

        // using this because next.js router is causing an error, probably related to https://github.com/vercel/next.js/issues/63121
        window.location.href = "/settings/code-review";
    });

    return {
        finishOnboardingReviewingPR,
        isFinishingOnboardingReviewingPR,
    };
};

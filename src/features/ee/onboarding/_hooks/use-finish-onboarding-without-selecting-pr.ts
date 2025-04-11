import { useAsyncAction } from "@hooks/use-async-action";
import { finishOnboarding } from "@services/codeManagement/fetch";
import { captureSegmentEvent } from "src/core/utils/segment";
import { isSelfHosted } from "src/core/utils/self-hosted";

import { startTeamTrial } from "../../subscription/_services/billing/fetch";

export const useFinishOnboardingWithoutSelectingPR = ({
    teamId,
    userId,
    organizationId,
}: {
    teamId: string;
    userId: string;
    organizationId: string;
}) => {
    const [
        finishOnboardingWithoutSelectingPR,
        { loading: isFinishingOnboardingWithoutSelectingPR },
    ] = useAsyncAction(async () => {
        finishOnboarding({ teamId, reviewPR: false });

        captureSegmentEvent({
            userId: userId!,
            event: "skip_first_review",
            properties: { teamId },
        });

        if (!isSelfHosted) {
            await startTeamTrial({ teamId, organizationId });
        }

        await new Promise((resolve) => setTimeout(resolve, 5000));

        // using this because next.js router is causing an error, probably related to https://github.com/vercel/next.js/issues/63121
        window.location.href = "/settings/code-review";
    });

    return {
        finishOnboardingWithoutSelectingPR,
        isFinishingOnboardingWithoutSelectingPR,
    };
};

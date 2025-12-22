import { useAsyncAction } from "@hooks/use-async-action";
import { finishOnboarding } from "@services/codeManagement/fetch";
import { useSuspenseGetBYOK } from "@services/organizationParameters/hooks";
import { waitFor } from "src/core/utils/helpers";
import { revalidateServerSideTag } from "src/core/utils/revalidate-server-side";
import { capturePosthogEvent } from "src/core/utils/posthog-client";
import { isSelfHosted } from "src/core/utils/self-hosted";

import { startTeamTrial } from "../../subscription/_services/billing/fetch";

export const useFinishOnboardingWithoutSelectingPR = ({
    teamId,
    userId: _userId,
    organizationId,
}: {
    teamId: string;
    userId: string;
    organizationId: string;
}) => {
    const byokConfig = useSuspenseGetBYOK();
    const choseBYOK = !!byokConfig?.configValue?.main;

    const [
        finishOnboardingWithoutSelectingPR,
        { loading: isFinishingOnboardingWithoutSelectingPR },
    ] = useAsyncAction(async () => {
        await finishOnboarding({ teamId, reviewPR: false });
        await revalidateServerSideTag("team-dependent");

        capturePosthogEvent({
            event: "skip_first_review",
            properties: { teamId },
        });

        if (!isSelfHosted) {
            await startTeamTrial({ teamId, organizationId, byok: choseBYOK });
        }

        await waitFor(5000);

        window.location.href = "/settings/code-review";
    });

    return {
        finishOnboardingWithoutSelectingPR,
        isFinishingOnboardingWithoutSelectingPR,
    };
};

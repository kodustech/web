import { redirect } from "next/navigation";
import { useSuspenseGetConnections } from "@services/setup/hooks";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";
import { safeArray } from "src/core/utils/safe-array";
import { isSelfHosted } from "src/core/utils/self-hosted";

export const useGoToStep = () => {
    const { teamId } = useSelectedTeamId();
    const connections = useSuspenseGetConnections(teamId);

    const codeManagementConnections = safeArray(connections).filter(
        (c) => c.category === "CODE_MANAGEMENT" && c.hasConnection,
    );

    if (codeManagementConnections.length) {
        const nextStepPath = isSelfHosted
            ? "/setup/byok"
            : "/setup/choosing-repositories";

        redirect(nextStepPath);
    }
};

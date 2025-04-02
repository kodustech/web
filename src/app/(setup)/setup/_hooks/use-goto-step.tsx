import { redirect } from "next/navigation";
import { useSuspenseGetConnections } from "@services/setup/hooks";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";

export const useGoToStep = () => {
    const { teamId } = useSelectedTeamId();
    const connections = useSuspenseGetConnections(teamId);

    const codeManagementConnections = connections.filter(
        (c) => c.category === "CODE_MANAGEMENT" && c.hasConnection,
    );

    if (codeManagementConnections.length)
        redirect("/setup/choosing-repositories");
};

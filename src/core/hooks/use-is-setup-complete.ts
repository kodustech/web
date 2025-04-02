import { useAllTeams } from "../providers/all-teams-context";
import { userSetupIsComplete } from "../utils/validators";

export const useIsSetupComplete = () => {
    const { teams } = useAllTeams();
    return userSetupIsComplete(teams);
};

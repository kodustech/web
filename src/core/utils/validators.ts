import type { Team } from "@services/teams/types";

import { TEAM_STATUS } from "../types";

export const userSetupIsComplete = (teams: Team[]) =>
    teams.length > 0 &&
    teams.some((team) => team.status === TEAM_STATUS.ACTIVE);

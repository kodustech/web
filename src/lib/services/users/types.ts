import type { TeamRole, UserRole } from "@enums";
import { UserStatus } from "@services/setup/types";
import type { Organization } from "@services/teams/types";

export interface User {
    uuid: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    organization: Organization;
    teamMember: Array<{
        uuid: string;
        status: boolean;
        name: string;
        avatar?: string;
        teamRole: TeamRole;
        createdAt: Date;
    }>;
}

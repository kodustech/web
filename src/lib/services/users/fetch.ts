import { axiosAuthorized } from "src/core/utils/axios";

import { USERS_PATHS } from ".";
import { IUser } from "./types";

export const joinOrganization = async (
    userId: string,
    organizationId: string,
) => {
    const response = await axiosAuthorized.post<IUser>(
        USERS_PATHS.JOIN_ORGANIZATION,
        {
            userId,
            organizationId,
        },
    );

    return response;
};

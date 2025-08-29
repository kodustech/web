import { typedFetch } from "@services/fetch";
import { UserStatus } from "@services/setup/types";
import { axiosAuthorized } from "src/core/utils/axios";
import { pathToApiUrl } from "src/core/utils/helpers";

import { USERS_PATHS } from ".";
import { User } from "./types";

export const joinOrganization = async (
    userId: string,
    organizationId: string,
) => {
    const response = await axiosAuthorized.post<User>(
        USERS_PATHS.JOIN_ORGANIZATION,
        { userId, organizationId },
    );

    return response;
};

export const approveUser = async (userId: string) =>
    axiosAuthorized.patch(`${pathToApiUrl(`/user/${userId}`)}`, {
        status: UserStatus.ACTIVE,
    });

export const getUserInfo = () => typedFetch<User>(USERS_PATHS.USER_INFO);

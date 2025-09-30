import { UserStatus } from "@enums";
import { authorizedFetch } from "@services/fetch";
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

export const updateUser = async (
    userId: string,
    data: Pick<Partial<User>, "role" | "status">,
) => {
    const response = await axiosAuthorized.patch<User>(
        pathToApiUrl(`/user/${userId}`),
        data,
    );

    return response;
};

export const getUserInfo = () => authorizedFetch<User>(USERS_PATHS.USER_INFO);

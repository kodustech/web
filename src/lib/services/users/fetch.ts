import { redirect } from "next/navigation";
import { typedFetch } from "@services/fetch";
import { UserStatus } from "@services/setup/types";
import { axiosAuthorized } from "src/core/utils/axios";

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

export const getUserInfo = async (props?: { redirect?: boolean }) => {
    const redirectToPage = props?.redirect ?? true;

    const userInfo = await typedFetch<User>(USERS_PATHS.USER_INFO);

    if (redirectToPage && userInfo.status === UserStatus.PENDING)
        redirect("/user-waiting-for-approval");

    return userInfo;
};

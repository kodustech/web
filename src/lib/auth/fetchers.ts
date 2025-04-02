import { typedFetch } from "@services/fetch";
import { API_ROUTES } from "src/core/config/constants";
import type { TODO } from "src/core/types";
import { axiosApi } from "src/core/utils/axios";
import { pathToApiUrl } from "src/core/utils/helpers";

import { AuthProviders } from "./types";

export const checkForEmailExistence = (email: string): Promise<TODO> => {
    return axiosApi.get(pathToApiUrl(API_ROUTES.checkForEmailExistence), {
        params: { email },
    });
};

export const loginEmailPassword = (credentials: {
    email: string;
    password: string;
}): Promise<TODO> => {
    return axiosApi.post(pathToApiUrl(API_ROUTES.login), credentials);
};

export const registerUser = (payload: {
    name: string;
    email: string;
    password: string;
}): Promise<{
    data: {
        statusCode: number;
    };
}> => {
    return axiosApi.post(pathToApiUrl(API_ROUTES.register), payload);
};

export const forgotPassword = (payload: {
    email: string;
    callbackUrl: string;
}): Promise<TODO> => {
    return axiosApi.post(pathToApiUrl(API_ROUTES.forgotPassword), payload);
};

export const createNewPassword = (payload: {
    email: string;
    password: string;
    callbackUrl: string;
}): Promise<TODO> => {
    return axiosApi.post(pathToApiUrl(API_ROUTES.createNewPassword), payload);
};

export const completeUserInvitation = (payload: {
    name: string;
    password: string;
    uuid: string;
}): Promise<TODO> => {
    return axiosApi.post(
        pathToApiUrl(API_ROUTES.completeUserInvitation),
        payload,
    );
};

export const logout = (payload: TODO): Promise<TODO> => {
    return axiosApi.post(pathToApiUrl(API_ROUTES.logout), payload);
};

export const refreshAccessToken = (payload: TODO): Promise<TODO> => {
    return axiosApi.post(pathToApiUrl(API_ROUTES.refreshToken), payload);
};

export const getInviteData = async (userId: string) => {
    try {
        const data = await typedFetch<{
            uuid: string;
            email: string;
            organization: { name: string };
        }>(pathToApiUrl(API_ROUTES.getInviteData), {
            params: { userId },
            signedIn: false,
        });
        return data;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to fetch invite data: ${error.message}`);
        }

        throw error;
    }
};

export const loginOAuth = (
    name: string,
    email: string,
    refreshToken: string,
    authProvider: AuthProviders,
): Promise<TODO> => {
    return axiosApi.post(pathToApiUrl(API_ROUTES.loginOAuth), {
        name,
        email,
        refreshToken,
        authProvider,
    });
};

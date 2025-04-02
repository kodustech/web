import { parseJwt } from "src/core/utils/helpers";

import { JwtPayload } from "../types";
import { axiosApi } from "./axios";

export const getCurrentUser = async (session: any) => {
    try {
        const token = session?.user?.accessToken;
        const parsedToken = parseJwt(token);

        if (!parsedToken) {
            throw new Error("Invalid token");
        }

        const { email, sub } = parsedToken.payload as JwtPayload;

        if (!email || !sub) {
            throw new Error("Invalid token payload");
        }

        return { email, userId: sub };
    } catch (error) {
        console.log("getCurrentUser session error");
        return null;
    }
};

export const getJWTToken = async () => {
    try {
        const session = (await axiosApi.get(`/api/auth/session`)) as any;

        return session?.data?.user?.accessToken;
    } catch (error) {
        console.log("getJWTToken session error");
    }
};

export const getDataFromJWTRefreshToken = async (refreshToken: any) => {
    try {
        const session = { accessToken: "" };

        return session;
    } catch (error) {
        console.log("getDataFromJWTRefreshToken session error");
    }
};

export const getJWTRefreshToken = async () => {
    try {
        const session = { refreshToken: "" };

        return session?.refreshToken;
    } catch (error) {
        console.log("getJWTRefreshToken session error");
    }
};

import Axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { signOut } from "next-auth/react";

import { getJWTToken } from "./session";

const axiosClient = Axios.create({
    headers: {
        "Accept": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
    },
});

// TODO: rethink this logic, it works only for first refresh
// There is a problem with the originalRequest: _retry is always undefined in if
let retryRequest = false;

// axiosClient.interceptors.request.use(
//     async (request) => {
//         return request;
//     },
//     async (error) => {
//         // const originalRequest = error?.config;
//         // const errStatus = error?.response?.status;
//         // const refreshToken = await getJWTRefreshToken();

//         // console.log("session 1", refreshToken, errStatus);

//         // if (errStatus === 401 && !retryRequest) {
//         //     retryRequest = true;

//         //     const data = await refreshAccessToken({ refreshToken });

//         //     console.log("token data", data);

//         //     // originalRequest.headers.Authentication = token;

//         //     return axiosClient(originalRequest);
//         // }

//         return Promise.reject(error);
//     },
// );

axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        try {
            // const { data: session, status, update } = await useSession();

            // const originalRequest = error?.config;
            // const refreshToken = await getJWTRefreshToken();

            // if (error?.response?.status === 401 && !retryRequest) {
            //     await signOut();

            //     retryRequest = true;

            //     // const data = await refreshAccessToken({ refreshToken });

            //     // originalRequest.headers.Authentication = data.accessToken;
            //     // await update();

            //     // return axiosClient(originalRequest);
            // }

            // await axiosClient.post("/api/auth/signout", {
            //     csrfToken: await getCsrfToken(),
            // }); // Você pode precisar obter o CSRF token antes de fazer a solicitação

            return Promise.reject(error);
        } catch (error) {
            return Promise.reject(error);
        }
    },
);

export const axiosApi = {
    get: <T>(
        url: string,
        params?: AxiosRequestConfig<any>,
    ): Promise<AxiosResponse<any, any>> =>
        axiosClient.get<T>(url, {
            ...params,
        }),
    post: <T>(
        url: string,
        data: any,
        params?: AxiosRequestConfig<any>,
    ): Promise<AxiosResponse<any, any>> =>
        axiosClient.post<T>(url, data, {
            ...params,
        }),
    patch: <T>(
        url: string,
        data: any,
        params?: AxiosRequestConfig<any>,
    ): Promise<AxiosResponse<any, any>> =>
        axiosClient.patch<T>(url, data, {
            ...params,
        }),
    delete: <T>(
        url: string,
        params?: AxiosRequestConfig<any>,
    ): Promise<AxiosResponse<any, any>> =>
        axiosClient.delete<T>(url, {
            ...params,
        }),
};

const fetcher = async <T>(url: string, params?: AxiosRequestConfig<any>) => {
    const headers = {
        Authorization: "Bearer " + (await getJWTToken()),
    };

    const axiosParams = {
        headers,
        withCredentials: true,
        ...params,
    };

    return axiosApi.get<T>(url, axiosParams).then((res) => res.data);
};

const post = async <T>(
    url: string,
    data: any,
    params?: AxiosRequestConfig<any>,
): Promise<T> => {
    const headers = {
        Authorization: "Bearer " + (await getJWTToken()),
    };

    const axiosParams = {
        ...params,
        headers,
        withCredentials: true,
    };

    return axiosApi.post<T>(url, data, axiosParams).then((res) => res.data);
};

const patch = async <T>(
    url: string,
    data: any,
    params?: AxiosRequestConfig<any>,
): Promise<T> => {
    const headers = {
        Authorization: "Bearer " + (await getJWTToken()),
    };

    const axiosParams = {
        ...params,
        headers,
        withCredentials: true,
    };

    return axiosApi.patch<T>(url, data, axiosParams).then((res) => res.data);
};

const deleted = async <T>(
    url: string,
    params?: AxiosRequestConfig<any>,
): Promise<T> => {
    const headers = {
        Authorization: "Bearer " + (await getJWTToken()),
    };

    const axiosParams = {
        ...params,
        headers,
        withCredentials: true,
    };

    return axiosApi.delete<T>(url, axiosParams).then((res) => res.data);
};

export const axiosAuthorized = {
    post,
    fetcher,
    deleted,
    patch,
};

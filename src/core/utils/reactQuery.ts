import {
    MutationFunction,
    useMutation,
    UseMutationResult,
    useQuery,
    useQueryClient,
    UseQueryOptions,
    useSuspenseQuery,
    type UseSuspenseQueryOptions,
} from "@tanstack/react-query";
import { AxiosError, AxiosRequestConfig } from "axios";

import { useAuth } from "../providers/auth.provider";
import { axiosApi, axiosAuthorized } from "./axios";

export const useSuspenseFetch = <T>(
    url: string | null,
    params?: { params: Record<string, unknown> },
    config?: Omit<UseSuspenseQueryOptions<T, Error>, "queryKey"> & {
        fallbackData?: T;
    },
) => {
    const queryKey = generateQueryKey(url!, params);
    const { jwt } = useAuth();

    const context = useSuspenseQuery<T, Error>({
        ...config,
        queryKey,
        queryFn: async ({ queryKey, signal }) => {
            const [url, serializedParams] = queryKey as [string, string?];

            const JSONParams = serializedParams
                ? JSON.parse(serializedParams)
                : {};

            let urlWithParams = url;
            if (Object.keys(JSONParams).length > 0) {
                urlWithParams += `?${new URLSearchParams(JSONParams.params).toString()}`;
            }

            const response = await fetch(urlWithParams, {
                signal,
                headers: {
                    Authorization: `Bearer ${jwt}`,
                },
            });

            const json = (await response.json()) as {
                statusCode: 200 | 201;
                data: T;
            };

            if (json.statusCode !== 200 && json.statusCode !== 201) {
                if (config?.fallbackData) return config?.fallbackData;

                throw new Error(
                    `Request with url "${url}" and params "${JSON.stringify(params?.params)}" failed with status ${json.statusCode}`,
                );
            }

            return json.data as T;
        },
    });

    return context.data;
};

export const useFetch = <T>(
    url: string | null,
    params?: AxiosRequestConfig<any>,
    enabledCondition?: boolean,
    config?: Omit<UseQueryOptions<T, Error>, "queryKey" | "queryFn">,
): ReturnType<typeof useQuery<T, Error>> => {
    const queryKey = generateQueryKey(url!, params);

    const mergedConfig = {
        retry: false,
        ...config,
    };

    const context = useQuery<T, Error>({
        queryKey,
        queryFn: ({ queryKey, signal }) => {
            const [url, serializedParams] = queryKey as [string, string?];
            const params = serializedParams
                ? JSON.parse(serializedParams)
                : undefined;

            const axiosConfig: AxiosRequestConfig<any> = {
                ...params,
                signal,
            };

            return axiosAuthorized
                .fetcher<T>(url, axiosConfig)
                .then((res: { data: any }) => res.data);
        },
        enabled: !!url && enabledCondition,
        ...mergedConfig,
    });

    return context;
};

const useGenericMutation = <T, S>(
    func: MutationFunction<S, S>,
    url: string,
    params?: AxiosRequestConfig<any>,
    updater?: (oldData: T | undefined, newData: S) => T,
): UseMutationResult<
    S,
    AxiosError<unknown, any>,
    S,
    { previousData: T | undefined }
> => {
    const queryClient = useQueryClient();

    const queryKey = generateQueryKey(url, params);

    return useMutation<
        S,
        AxiosError<unknown, any>,
        S,
        { previousData: T | undefined }
    >({
        mutationFn: func,
        onMutate: async (variables: S) => {
            await queryClient.cancelQueries({ queryKey });

            const previousData = queryClient.getQueryData<T>(queryKey);

            if (updater && previousData !== undefined) {
                queryClient.setQueryData<T>(queryKey, (oldData) =>
                    updater(oldData, variables),
                );
            }

            // Retorne o contexto com previousData
            return { previousData };
        },
        onError: (err, variables, context) => {
            if (context?.previousData !== undefined) {
                queryClient.setQueryData<T>(queryKey, context.previousData);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });
};

export const useDelete = <T>(
    url: string,
    params?: AxiosRequestConfig<any>,
    updater?: (oldData: T | undefined, id: string | number) => T,
): UseMutationResult<
    any,
    AxiosError<unknown, any>,
    string | number,
    { previousData: T | undefined }
> => {
    const mutationFunction: MutationFunction<any, string | number> = (
        id: string | number,
    ) => {
        return axiosApi.delete(`${url}/${id}`).then((res) => res.data);
    };

    return useGenericMutation<T, string | number>(
        mutationFunction,
        url,
        params,
        updater,
    );
};

export const usePost = <T, S>(
    url: string,
    params?: AxiosRequestConfig<any>,
    updater?: (oldData: T | undefined, newData: S) => T,
): UseMutationResult<
    S,
    AxiosError<unknown, any>,
    S,
    { previousData: T | undefined }
> => {
    const mutationFunction: MutationFunction<S, S> = (data: S) => {
        return axiosAuthorized.post<S>(url, data);
    };

    return useGenericMutation<T, S>(mutationFunction, url, params, updater);
};

export const useUpdate = <T, S>(
    url: string,
    params?: AxiosRequestConfig<any>,
    updater?: (oldData: T | undefined, newData: S) => T,
): UseMutationResult<
    S,
    AxiosError<unknown, any>,
    S,
    { previousData: T | undefined }
> => {
    const mutationFunction: MutationFunction<S, S> = (data: S) => {
        return axiosAuthorized.patch<S>(url, data);
    };

    return useGenericMutation<T, S>(mutationFunction, url, params, updater);
};

export function generateQueryKey(url: string, params?: any): string[] {
    if (params) return [url, JSON.stringify(params)];
    return [url];
}

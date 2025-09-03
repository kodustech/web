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
import { axiosAuthorized } from "./axios";
import { addSearchParamsToUrl } from "./url";

export const useSuspenseFetch = <T>(
    url: string | null,
    params?: {
        params: Record<string, string | number | boolean | undefined | null>;
    },
    config?: Omit<UseSuspenseQueryOptions<T, Error>, "queryKey"> & {
        fallbackData?: T;
    },
) => {
    const queryKey = generateQueryKey(url!, params);
    const { accessToken } = useAuth();

    const context = useSuspenseQuery<T, Error>({
        ...config,
        queryKey,
        queryFn: async ({ signal }) => {
            const urlWithParams = addSearchParamsToUrl(url!, params?.params);

            const response = await fetch(urlWithParams, {
                signal,
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            const text = await response.text();

            let json: { statusCode: number; data: T | undefined };

            try {
                json = JSON.parse(text);
            } catch {
                if (config?.fallbackData) return config?.fallbackData;
                json = { statusCode: 500, data: undefined };
            }

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
        queryFn: ({ signal }) => {
            const axiosConfig: AxiosRequestConfig<any> = {
                ...params,
                signal,
            };

            return axiosAuthorized
                .fetcher<T>(url!, axiosConfig)
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

export function generateQueryKey(
    url: string,
    params?: { params?: Record<string, unknown> },
): [string, Record<string, unknown>?] {
    if (params) return [url, sortKeysFor(params)];
    return [url];
}

const sortKeysFor = (obj: Record<string, unknown>): Record<string, unknown> =>
    Object.keys(obj)
        .sort()
        .reduce(
            (o, key) => {
                o[key] = obj[key];
                return o;
            },
            {} as Record<string, unknown>,
        );

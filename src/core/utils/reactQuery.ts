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

/**
 * Suspense-enabled data fetching hook
 *
 * Error handling strategy:
 * - Network/parse errors: use fallbackData if available, otherwise throw
 * - 404 (Not Found): use fallbackData if available (resource doesn't exist yet)
 * - Other API errors (400, 500, etc): always throw - show error to user
 *
 * Errors should be caught by an ErrorBoundary (use PageBoundary).
 *
 * @example
 * <PageBoundary>
 *   <MyComponent />
 * </PageBoundary>
 *
 * function MyComponent() {
 *   const data = useSuspenseFetch<User>('/api/user', {}, {
 *     fallbackData: { name: 'Guest' } // Used for network errors or 404
 *   });
 *   return <div>{data.name}</div>;
 * }
 */
export const useSuspenseFetch = <T>(
    url: string | null,
    params?: {
        params: Record<string, string | number | boolean | undefined | null>;
    },
    config?: Omit<UseSuspenseQueryOptions<T, Error>, "queryKey"> & {
        /** Used for network errors, parse errors, and 404 (resource not found) */
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

            let response: Response;
            try {
                response = await fetch(urlWithParams, {
                    signal,
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
            } catch (networkError) {
                // Network error (offline, DNS, etc) - use fallback if available
                if (config?.fallbackData !== undefined) {
                    return config.fallbackData;
                }
                throw new Error(`Network error fetching ${url}`);
            }

            const text = await response.text();

            let json: { statusCode: number; data: T | undefined };
            try {
                json = JSON.parse(text);
            } catch {
                // JSON parse error - use fallback if available
                if (config?.fallbackData !== undefined) {
                    return config.fallbackData;
                }
                throw new Error(`Invalid JSON response from ${url}`);
            }

            // 404 Not Found - resource doesn't exist, use fallback if available
            if (json.statusCode === 404) {
                if (config?.fallbackData !== undefined) {
                    return config.fallbackData;
                }
                throw new Error(`Resource not found: ${url}`);
            }

            // Other API errors (400, 500, etc) - always throw, show to user
            if (json.statusCode !== 200 && json.statusCode !== 201) {
                throw new Error(
                    `Request failed: ${url} returned status ${json.statusCode}`,
                );
            }

            return json.data as T;
        },
    });

    return context.data;
};

/**
 * Standard data fetching hook (non-suspense)
 *
 * Returns loading/error states that should be handled by the component.
 * Uses global retry configuration from QueryProvider.
 */
export const useFetch = <T>(
    url: string | null,
    params?: AxiosRequestConfig<any>,
    enabledCondition?: boolean,
    config?: Omit<UseQueryOptions<T, Error>, "queryKey" | "queryFn">,
): ReturnType<typeof useQuery<T, Error>> => {
    const queryKey = generateQueryKey(url!, params);

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
        ...config,
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

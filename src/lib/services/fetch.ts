import { redirect } from "next/navigation";
import { auth } from "src/core/config/auth";
import { isServerSide } from "src/core/utils/server-side";
import { getJWTToken } from "src/core/utils/session";
import { addSearchParamsToUrl } from "src/core/utils/url";

export class TypedFetchError extends Error {
    statusCode: number;
    statusText: string;
    url: string;

    static isError<T extends TypedFetchError>(
        this: new (...a: any[]) => T,
        error: unknown,
    ): error is T {
        return error instanceof this;
    }

    constructor(statusCode: number, statusText: string, url: string) {
        super(`Request error: ${statusCode} ${statusText} in URL: ${url}`);
        this.name = "TypedFetchError";
        this.statusCode = statusCode;
        this.statusText = statusText;
        this.url = url;
    }
}

export const authorizedFetch = async <Data>(
    url: Parameters<typeof typedFetch>[0],
    config?: Parameters<typeof typedFetch>[1],
): Promise<Data> => {
    let accessToken;
    if (isServerSide) {
        const jwtPayload = await auth();
        accessToken = jwtPayload?.user.accessToken;
    } else {
        accessToken = await getJWTToken();
    }

    try {
        const response = await typedFetch<{ data: Data }>(url, {
            ...config,
            headers: {
                ...config?.headers,
                Authorization: `Bearer ${accessToken}`,
            },
        });

        return response.data;
    } catch (error1) {
        if (TypedFetchError.isError(error1)) {
            if (error1.statusCode === 401) redirect("/sign-out");
        }

        return null as Data;
    }
};

export const typedFetch = async <Data>(
    url: string,
    config?: Parameters<typeof globalThis.fetch>[1] & {
        params?: Record<string, string | number | boolean | null | undefined>;
    },
): Promise<Data> => {
    const { params = {}, ...configRest } = config ?? {};

    const urlWithParams = addSearchParamsToUrl(url.toString(), params);

    try {
        const response = await fetch(urlWithParams, {
            ...configRest,
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                ...configRest.headers,
            },
        });

        if (!response.ok) {
            throw new TypedFetchError(
                response.status,
                response.statusText,
                urlWithParams,
            );
        }

        return response.json() as Data;
    } catch (error) {
        // Re-throw the error with more context if it's a network error
        if (
            error instanceof Error &&
            (error.message.includes("ENOTFOUND") ||
                error.message.includes("ECONNREFUSED"))
        ) {
            throw new Error(`Network error: ${error.message}`);
        }
        throw error;
    }
};

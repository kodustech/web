import { redirect } from "next/navigation";
import { auth } from "src/core/config/auth";

export class TypedFetchError extends Error {
    statusCode: number;
    statusText: string;
    url: string;

    constructor(statusCode: number, statusText: string, url: string) {
        super(`Request error: ${statusCode} ${statusText} in URL: ${url}`);
        this.name = "TypedFetchError";
        this.statusCode = statusCode;
        this.statusText = statusText;
        this.url = url;
    }
}

export const typedFetch = async <Data>(
    url: Parameters<typeof globalThis.fetch>[0],
    config?: Parameters<typeof globalThis.fetch>[1] & {
        params?: Record<string, string | number | boolean>;
        signedIn?: false;
    },
): Promise<Data> => {
    let accessToken = "";

    if (config?.signedIn !== false) {
        const session = await auth();

        if (!session?.user?.accessToken) {
            throw new Error(
                "Usuário não autenticado ou token de acesso ausente.",
            );
        }

        accessToken = session?.user?.accessToken;
    }

    const { params = {}, ...paramsRest } = config ?? {};
    const searchParams = new URLSearchParams(
        Object.entries(params).reduce(
            (acc, current) => {
                acc[current[0]] = current[1].toString();
                return acc;
            },
            {} as Record<string, string>,
        ),
    );
    const urlWithParams =
        searchParams.size > 0
            ? `${url}?${searchParams.toString()}`
            : url.toString();

    const response = await fetch(urlWithParams, {
        ...paramsRest,
        headers: {
            "Accept": "application/json",
            // Removendo "Access-Control-Allow-Origin"
            "Content-Type": "application/json",
            ...config?.headers,
            "Authorization": `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        if (response.status === 401) redirect("/sign-out");
        throw new TypedFetchError(
            response.status,
            response.statusText,
            urlWithParams,
        );
    }

    try {
        const json = await response?.json();
        return json?.data as Data;
    } catch (error) {
        return null as Data;
    }
};

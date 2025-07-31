import { TypedFetchError } from "@services/fetch";
import { createUrl } from "src/core/utils/helpers";
import { isServerSide } from "src/core/utils/server-side";
import { getJWTToken } from "src/core/utils/session";
import { getJwtPayload } from "src/lib/auth/utils";

export const mcpManagerFetch = async <Data>(
    _url: Parameters<typeof globalThis.fetch>[0],
    config?: Parameters<typeof globalThis.fetch>[1] & {
        params?: Record<string, string | number | boolean>;
    },
): Promise<Data> => {
    const { params = {}, ...paramsRest } = config ?? {};

    let authorization: string | undefined;

    const searchParams = new URLSearchParams(
        Object.entries(params).reduce(
            (acc, [k, v]) => {
                acc[k] = v.toString();
                return acc;
            },
            {} as Record<string, string>,
        ),
    );

    let hostName = process.env.WEB_HOSTNAME_MCP_MANAGER;

    if (isServerSide) {
        const jwtPayload = await getJwtPayload();
        authorization = jwtPayload?.jwt;
    } else {
        authorization = await getJWTToken();
    }

    // if 'true' we are in the server and hostname is not a domain
    if (isServerSide && hostName === "localhost") {
        hostName =
            process.env.GLOBAL_MCP_MANAGER_CONTAINER_NAME ||
            "kodus-mcp-manager";
    }

    const port = process.env.WEB_PORT_MCP_MANAGER;
    const url = createUrl(hostName, port, _url.toString(), {
        containerName: hostName,
    });

    const urlWithParams =
        searchParams.size > 0 ? `${url}?${searchParams.toString()}` : url;

    const response = await fetch(urlWithParams, {
        ...paramsRest,
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authorization}`,
            ...config?.headers,
        },
    });

    if (!response.ok) {
        throw new TypedFetchError(
            response.status,
            response.statusText,
            urlWithParams,
        );
    }

    return response.json();
};

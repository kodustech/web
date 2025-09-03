import { typedFetch } from "@services/fetch";
import { auth } from "src/core/config/auth";
import { createUrl } from "src/core/utils/helpers";
import { isServerSide } from "src/core/utils/server-side";
import { getJWTToken } from "src/core/utils/session";

export const mcpManagerFetch = async <Data>(
    _url: Parameters<typeof typedFetch>[0],
    config?: Parameters<typeof typedFetch>[1],
): Promise<Data> => {
    let authorization: string | undefined;

    let hostName = process.env.WEB_HOSTNAME_MCP_MANAGER;

    if (isServerSide) {
        const jwtPayload = await auth();
        authorization = jwtPayload?.user.accessToken;
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

    return typedFetch<Data>(url, {
        ...config,
        headers: {
            ...config?.headers,
            Authorization: `Bearer ${authorization}`,
        },
    });
};

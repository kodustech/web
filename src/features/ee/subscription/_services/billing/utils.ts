import { TypedFetchError } from "@services/fetch";
import { createUrl } from "src/core/utils/helpers";
import { isServerSide } from "src/core/utils/server-side";

export const billingFetch = async <Data>(
    _url: Parameters<typeof globalThis.fetch>[0],
    config?: Parameters<typeof globalThis.fetch>[1] & {
        params?: Record<string, string>;
    },
): Promise<Data> => {
    const { params, ...paramsRest } = config ?? {};
    const searchParams = new URLSearchParams(params);

    let hostName = process.env.WEB_HOSTNAME_BILLING;

    // if 'true' we are in the server and hostname is not a domain
    if (isServerSide && hostName === "localhost") {
        hostName =
            process.env.GLOBAL_BILLING_CONTAINER_NAME ||
            "kodus-service-billing";
    }

    const port = process.env.WEB_PORT_BILLING;
    const url = createUrl(hostName, port, `/api/billing/${_url}`, false);

    const urlWithParams =
        searchParams.size > 0 ? `${url}?${searchParams.toString()}` : url;

    try {
        const response = await fetch(urlWithParams, {
            ...paramsRest,
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                ...config?.headers,
            },
        });

        if (!response.ok) {
            throw new TypedFetchError(response.status, response.statusText);
        }

        return response.json();
    } catch (error) {
        return null as Data;
    }
};

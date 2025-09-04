import { typedFetch } from "@services/fetch";
import { createUrl } from "src/core/utils/helpers";
import { isServerSide } from "src/core/utils/server-side";

export const billingFetch = async <Data>(
    _url: Parameters<typeof typedFetch>[0],
    config?: Parameters<typeof typedFetch>[1],
): Promise<Data> => {
    let hostName = process.env.WEB_HOSTNAME_BILLING;

    // if 'true' we are in the server and hostname is not a domain
    if (isServerSide && hostName === "localhost") {
        hostName =
            process.env.GLOBAL_BILLING_CONTAINER_NAME ||
            "kodus-service-billing";
    }

    const port = process.env.WEB_PORT_BILLING;
    const url = createUrl(hostName, port, `/api/billing/${_url}`);

    try {
        return typedFetch(url, config);
    } catch {
        return null as Data;
    }
};

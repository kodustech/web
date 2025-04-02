import { IIntegrationConnector } from "./IIntegrationConnector";

const bitbucket = process.env.WEB_BITBUCKET_INSTALL_URL || "";

export class BitbucketConnection implements IIntegrationConnector {
    async connect(
        hasConnection: boolean,
        routerConfig: any,
        routerPath?: string,
    ) {
        if (hasConnection) {
            routerConfig.push(
                routerPath ||
                    `${routerConfig.pathname}/bitbucket/configuration`,
            );
        } else {
            window.location.href = bitbucket;
        }
    }
}

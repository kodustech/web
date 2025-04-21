import { IIntegrationConnector } from "./IIntegrationConnector";

export class AzureReposConnection implements IIntegrationConnector {
    async connect(
        hasConnection: boolean,
        routerConfig: any,
        routerPath?: string,
    ) {
        if (hasConnection) {
            routerConfig.push(
                routerPath ||
                    `${routerConfig.pathname}/azure-repos/configuration`,
            );
        }
    }
}

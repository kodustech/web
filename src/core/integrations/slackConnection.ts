import { IIntegrationConnector } from "./IIntegrationConnector";

const slack = process.env.WEB_CONNECTION_SLACK || "";

export class SlackConnection implements IIntegrationConnector {
    async connect(
        hasConnection: boolean,
        routerConfig: any,
        routerPath?: string,
    ): Promise<void> {
        if (hasConnection) {
            routerConfig.push(
                routerPath || `${routerConfig.pathname}/slack/configuration`,
            );
        } else {
            window.location.href = slack;
        }
    }
}

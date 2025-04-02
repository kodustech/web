import { IIntegrationConnector } from "./IIntegrationConnector";

export class DiscordConnection implements IIntegrationConnector {
    async connect(
        hasConnection: boolean,
        routerConfig: any,
        routerPath?: string,
    ) {
        if (hasConnection) {
            routerConfig.push(
                routerPath || `${routerConfig.pathname}/discord/configuration`,
            );
        } else {
            window.location.href =
                process.env.WEB_CONNECTION_DISCORD || "";
        }
    }
}

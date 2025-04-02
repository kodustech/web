import { IIntegrationConnector } from "./IIntegrationConnector";

const github = process.env.WEB_GITHUB_INSTALL_URL || "";

export class GitHubConnection implements IIntegrationConnector {
    async connect(
        hasConnection: boolean,
        routerConfig: any,
        routerPath?: string,
    ) {
        if (hasConnection) {
            routerConfig.push(
                routerPath || `${routerConfig.pathname}/github/configuration`,
            );
        } else {
            window.location.href = github;
        }
    }
}

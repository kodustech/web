import { IIntegrationConnector } from "./IIntegrationConnector";

const oauthURL = process.env.WEB_GITLAB_OAUTH_URL || "";
const scopes = process.env.WEB_GITLAB_SCOPES || "";
const clientId = process.env.GLOBAL_GITLAB_CLIENT_ID;
const redirectURI = process.env.GLOBAL_GITLAB_REDIRECT_URL;

export class GitlabConnection implements IIntegrationConnector {
    async connect(
        hasConnection: boolean,
        routerConfig: any,
        routerPath?: string,
    ) {
        if (hasConnection) {
            routerConfig.push(
                routerPath || `${routerConfig.pathname}/gitlab/configuration`,
            );
        } else {
            window.location.href = `${oauthURL}?client_id=${clientId}&redirect_uri=${redirectURI}&response_type=code&scope=${encodeURIComponent(scopes)}&state=${Math.random().toString(36).substring(7)}`;
        }
    }
}

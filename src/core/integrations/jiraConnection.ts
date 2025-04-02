import { IIntegrationConnector } from "./IIntegrationConnector";

const scopeToReturnRefreshToken = "%20offline_access";

const jiraUrl = `https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=${
    process.env.GLOBAL_JIRA_CLIENT_ID
}&scope=${
    process.env.WEB_JIRA_SCOPES
}${scopeToReturnRefreshToken}&redirect_uri=${encodeURI(
    process.env.GLOBAL_JIRA_REDIRECT_URL ?? "",
)}%2Fsetup%2Fjira&response_type=code&prompt=consent`;

export class JiraConnection implements IIntegrationConnector {
    async connect(
        hasConnection: boolean,
        routerConfig: any,
        routerPath?: string,
        url?: string,
    ): Promise<void> {
        if (hasConnection && url) {
            routerConfig.push(`${routerConfig.pathname}/${url}`);
        } else {
            window.location.href = jiraUrl;
        }
    }
}

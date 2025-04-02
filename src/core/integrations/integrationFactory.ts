import { INTEGRATIONS_KEY } from "@enums";

import { BitbucketConnection } from "./bitbucketConnection";
import { DiscordConnection } from "./discordConnection";
import { GitHubConnection } from "./gitHubConnection";
import { GitlabConnection } from "./gitlabConnection";
import { IIntegrationConnector } from "./IIntegrationConnector";
import { JiraConnection } from "./jiraConnection";
import { SlackConnection } from "./slackConnection";

class IntegrationFactory {
    private connectors: { [key: string]: IIntegrationConnector };

    constructor() {
        this.connectors = {
            [INTEGRATIONS_KEY.GITHUB]: new GitHubConnection(),
            [INTEGRATIONS_KEY.JIRA]: new JiraConnection(),
            [INTEGRATIONS_KEY.SLACK]: new SlackConnection(),
            [INTEGRATIONS_KEY.DISCORD]: new DiscordConnection(),
            [INTEGRATIONS_KEY.GITLAB]: new GitlabConnection(),
            [INTEGRATIONS_KEY.BITBUCKET]: new BitbucketConnection(),
        };
    }

    getConnector(key: string): IIntegrationConnector | null {
        return this.connectors[key.toLowerCase()] || null;
    }
}

const factoryInstance = new IntegrationFactory();

export default factoryInstance;

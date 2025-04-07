let withBundleAnalyzer = (config) => config;

if (process.env.ANALYZE === "true") {
    // Só carrega o bundle analyzer se a variável ANALYZE for 'true'
    withBundleAnalyzer = require("@next/bundle-analyzer")({
        enabled: true,
    });
}

/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "github.com",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com",
                port: "",
                pathname: "/**",
            },
        ],
    },
    async rewrites() {
        return [
            {
                source: "/setup/jira/configuration",
                destination: "/setup/configuration/jira",
            },
            {
                source: "/teams/:teamId/integrations/jira/configuration",
                destination: "/teams/:teamId/configuration/jira",
            },
            {
                source: "/setup/slack/configuration",
                destination: "/setup/configuration/slack",
            },
            {
                source: "/teams/:teamId/integrations/slack/configuration",
                destination: "/teams/:teamId/configuration/slack",
            },
            {
                source: "/setup/teams/configuration",
                destination: "/setup/configuration/teams",
            },
            {
                source: "/teams/:teamId/integrations/teams/configuration",
                destination: "/teams/:teamId/configuration/teams",
            },
            {
                source: "/setup/github/configuration",
                destination: "/setup/configuration/github",
            },
            {
                source: "/setup/gitlab/configuration",
                destination: "/setup/configuration/gitlab",
            },
            {
                source: "/teams/:teamId/integrations/gitlab/configuration",
                destination: "/teams/:teamId/configuration/gitlab",
            },
            {
                source: "/teams/:teamId/integrations/github/configuration",
                destination: "/teams/:teamId/configuration/github",
            },
            {
                source: "/setup/jira/configuration/select-columns",
                destination: "/setup/configuration/jira/columns",
            },
            {
                source: "/teams/:teamId/integrations/jira/configuration/select-columns",
                destination: "/teams/:teamId/configuration/jira/columns",
            },
            {
                source: "/setup/azure-boards/configuration/select-columns",
                destination: "/setup/configuration/azure-boards/columns",
            },
            {
                source: "/setup/azure-boards/configuration",
                destination: "/setup/configuration/azure-boards",
            },
            {
                source: "/teams/:teamId/integrations/azure-repos/configuration",
                destination: "/teams/:teamId/configuration/azure-repos",
            },
            {
                source: "/setup/azure-repos/configuration",
                destination: "/setup/configuration/azure-repos",
            },
            {
                source: "/teams/:teamId/integrations/azure-boards/configuration",
                destination: "/teams/:teamId/configuration/azure-boards",
            },
            {
                source: "/setup/discord/configuration",
                destination: "/setup/configuration/discord",
            },
            {
                source: "/teams/:teamId/integrations/discord/configuration",
                destination: "/teams/:teamId/configuration/discord",
            },
            {
                source: "/setup/bitbucket/configuration",
                destination: "/setup/configuration/bitbucket",
            },
            {
                source: "/teams/:teamId/integrations/bitbucket/configuration",
                destination: "/teams/:teamId/configuration/bitbucket",
            },
        ];
    },
    reactStrictMode: true,
    env: {
        WEB_NODE_ENV: process.env.WEB_NODE_ENV,
        WEB_HOSTNAME_API: process.env.WEB_HOSTNAME_API,
        WEB_PORT_API: process.env.WEB_PORT_API,
        WEB_CONNECTION_SLACK: process.env.WEB_CONNECTION_SLACK,
        WEB_CONNECTION_DISCORD: process.env.WEB_CONNECTION_DISCORD,
        GLOBAL_JIRA_REDIRECT_URL: process.env.GLOBAL_JIRA_REDIRECT_URL,
        WEB_JIRA_SCOPES: process.env.WEB_JIRA_SCOPES,
        GLOBAL_JIRA_CLIENT_ID: process.env.GLOBAL_JIRA_CLIENT_ID,
        GLOBAL_GITHUB_CLIENT_ID: process.env.GLOBAL_GITHUB_CLIENT_ID,
        GLOBAL_GITHUB_REDIRECT_URL: process.env.GLOBAL_GITHUB_REDIRECT_URL,
        WEB_GITHUB_INSTALL_URL: process.env.WEB_GITHUB_INSTALL_URL,
        GLOBAL_GITLAB_CLIENT_ID: process.env.GLOBAL_GITLAB_CLIENT_ID,
        GLOBAL_GITLAB_REDIRECT_URL: process.env.GLOBAL_GITLAB_REDIRECT_URL,
        WEB_GITLAB_SCOPES: process.env.WEB_GITLAB_SCOPES,
        WEB_GITLAB_OAUTH_URL: process.env.WEB_GITLAB_OAUTH_URL,
        WEB_TERMS_AND_CONDITIONS: process.env.WEB_TERMS_AND_CONDITIONS,
        WEB_SUPPORT_DOCS_URL: process.env.WEB_SUPPORT_DOCS_URL,
        WEB_SUPPORT_DISCORD_INVITE_URL:
            process.env.WEB_SUPPORT_DISCORD_INVITE_URL,
        WEB_SUPPORT_TALK_TO_FOUNDER_URL:
            process.env.WEB_SUPPORT_TALK_TO_FOUNDER_URL,
        WEB_BITBUCKET_INSTALL_URL: process.env.WEB_BITBUCKET_INSTALL_URL,
        GLOBAL_KODUS_SERVICE_SLACK: process.env.GLOBAL_KODUS_SERVICE_SLACK,
        GLOBAL_KODUS_SERVICE_DISCORD: process.env.GLOBAL_KODUS_SERVICE_DISCORD,
        WEB_HOSTNAME_BILLING: process.env.WEB_HOSTNAME_BILLING,
        WEB_PORT_BILLING: process.env.WEB_PORT_BILLING,
        GLOBAL_BILLING_CONTAINER_NAME:
            process.env.GLOBAL_BILLING_CONTAINER_NAME,
    },
};

module.exports = withBundleAnalyzer(nextConfig);

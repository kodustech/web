import { decodeJwt, decodeProtectedHeader } from "jose";
import type { JWT } from "next-auth/jwt";
import { CodeReviewRepositoryConfig } from "src/app/(app)/settings/code-review/_types";
import invariant from "tiny-invariant";

import { API_ROUTES } from "../config/constants";
import { type LiteralUnion } from "../types";
import { isSelfHosted } from "../utils/self-hosted";
import { isServerSide } from "./server-side";

const containerName =
    process.env.GLOBAL_API_CONTAINER_NAME || "kodus-orchestrator";

export function pathToApiUrl(
    path: API_ROUTES | string,
    params?: Record<string, string | number | boolean>,
): string {
    invariant(path, "Api path doesn't exist");

    let hostName = process.env.WEB_HOSTNAME_API;

    // if 'true' we are in the server and hostname is not a domain
    if (isServerSide && hostName === "localhost") {
        hostName = containerName;
    }

    if (params) {
        Object.keys(params).forEach((key) => {
            path = path.replace(`:${key}`, params[key].toString());
        });
    }

    const port = process.env.WEB_PORT_API;

    return createUrl(hostName, port, path);
}

export function pathToSlackApiUrl(path: API_ROUTES | string): string {
    invariant(path, "Api path doesn't exist");

    const defaultSlackHostname = "https://slack.com/api";
    const hostName = process.env.GLOBAL_SLACK_HOSTNAME || defaultSlackHostname;

    if (!process.env.GLOBAL_SLACK_HOSTNAME) {
        console.warn(
            "Warning: Slack hostname is not configured. Using default:",
            defaultSlackHostname,
        );
    }

    const defaultSlackPort = "";
    const port = process.env.WEB_SLACK_PORT_API || defaultSlackPort;

    if (!process.env.WEB_SLACK_PORT_API) {
        console.warn(
            "Warning: Slack port is not configured. Using default:",
            defaultSlackPort,
        );
    }

    return createUrl(hostName, port, path);
}

export function pathToDiscordApiUrl(path: API_ROUTES | string): string {
    invariant(path, "Api path doesn't exist");

    const defaultDiscordUrl = "https://discord.com/api";
    const serviceUrl = process.env.GLOBAL_DISCORD_HOSTNAME || defaultDiscordUrl;

    if (!process.env.GLOBAL_DISCORD_HOSTNAME) {
        console.warn(
            "Warning: Discord service URL is not configured. Using default:",
            defaultDiscordUrl,
        );
    }

    return `${serviceUrl}${path}`;
}

export function createUrl(
    hostName?: string,
    port?: string,
    path?: string,
    options?: { containerName?: string },
): string {
    let finalPort: string;
    let protocol: string;

    const defaultOptions = { containerName };
    const config = { ...defaultOptions, ...options };

    const isProduction = process.env.WEB_NODE_ENV === "production";

    if (
        isProduction ||
        (isSelfHosted &&
            hostName !== "localhost" &&
            hostName !== config.containerName)
    ) {
        // Cases: Production OR (SelfHosted with a specific domain)
        protocol = "https";
        finalPort = "";
    } else {
        // Cases: Development OR (SelfHosted running on localhost)
        // Also implicitly covers isDevelopment(), because if it's not production nor self-hosted with a domain,
        // and isDevelopment() is true, it will fall here.
        // If it's self-hosted and hostname === "localhost", it will also fall here.

        const HTTP = "http://";
        const HTTPS = "https://";
        if (hostName?.includes(HTTP)) {
            protocol = "http";
            hostName = hostName.replace(HTTP, "");
        } else if (hostName?.includes(HTTPS)) {
            protocol = "https";
            hostName = hostName.replace(HTTPS, "");
        } else {
            protocol = "http";
        }

        finalPort = port ? `:${port}` : "";
    }

    return `${protocol}://${hostName}${finalPort}${path}`;
}

export function isJwtExpired(expirationDate: number) {
    const THRESHOLD = 300;
    const expirationInMilliseconds = expirationDate * 1000;
    return Date.now() > expirationInMilliseconds - THRESHOLD;
}

export function parseJwt(jwt: string | null | undefined): {
    headers: Record<string, any>;
    payload: JWT;
} | null {
    if (!jwt) return null;

    try {
        const headers = decodeProtectedHeader(jwt);
        const payload = decodeJwt(jwt) as JWT;

        if (!payload || !headers) return null;

        return { headers, payload };
    } catch (error) {
        console.warn("Error decoding jwt token:", error);
        return null;
    }
}

export function formatNameToAvatar(name: string) {
    if (!name) return "";
    const nameSplit = name?.split(" ");
    const lettersAvatar =
        nameSplit?.length === 1
            ? nameSplit[0]?.substring(0, 2)
            : nameSplit[0]?.substring(0, 1) + nameSplit[1]?.substring(0, 1);

    return lettersAvatar?.toUpperCase() ?? "";
}

export function greeting(name?: string) {
    const hour = new Date().getHours();
    let message = "";

    if (hour >= 6 && hour < 12) {
        message = "👋 Good morning";
    } else if (hour >= 12 && hour < 18) {
        message = "👋 Good afternoon";
    } else {
        message = "👋 Good evening";
    }

    if (name) message += ` ${name}`;
    message += "!";

    return message;
}

export const formatPeriodLabel = (period: string): string => {
    const labels: Record<string, string> = {
        today: "Today",
        yesterday: "Yesterday",
        threeDaysAgo: "3 days ago",
        fourDaysAgo: "4 days ago",
        fiveDaysAgo: "5 days ago",
        sixDaysAgo: "6 days ago",
        lastWeek: "Last week",
        twoWeeksAgo: "Two weeks ago",
        older: "Older",
        setup: "Setup",
    };

    return labels[period] || period;
};

export const codeReviewConfigRemovePropertiesNotInType = (
    config: Partial<CodeReviewRepositoryConfig>,
) => {
    const newConfig: Partial<CodeReviewRepositoryConfig> = {};
    const expectedKeys: LiteralUnion<keyof CodeReviewRepositoryConfig>[] = [
        "id",
        "name",
        "path",
        "automatedReviewActive",
        "reviewCadence",
        "baseBranches",
        "ignoredTitleKeywords",
        "ideRulesSyncEnabled",
        "ignorePaths",
        "reviewOptions",
        "kodusConfigFileOverridesWebPreferences",
        "pullRequestApprovalActive",
        "suggestionControl",
        "summary",
        "isRequestChangesActive",
        "kodyRulesGeneratorEnabled",
        "runOnDraft",
        "codeReviewVersion",
    ];

    expectedKeys.forEach((key) => {
        if (!config.hasOwnProperty(key)) return;
        newConfig[key as keyof typeof newConfig] = config[
            key as keyof typeof newConfig
        ] as any;
    });

    return newConfig;
};

// Used for tests, it simulates waiting for an specified amount of milliseconds
export const waitFor = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

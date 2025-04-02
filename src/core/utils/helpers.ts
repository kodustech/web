import { decodeJwt, decodeProtectedHeader } from "jose";
import { CodeReviewRepositoryConfig } from "src/app/(app)/settings/code-review/_components/pages/types";
import invariant from "tiny-invariant";

import { API_ROUTES } from "../config/constants";
import { JwtPayload, ParsedJwt } from "../types";
import { isServerSide } from "./server-side";

export function pathToApiUrl(
    path: API_ROUTES | string,
    params?: Record<string, string>,
): string {
    invariant(path, "Api path doesn't exist");

    let hostName = process.env.WEB_HOSTNAME_API;

    // if 'true' we are in the server and hostname is not a domain
    if (isServerSide && hostName === "localhost") {
        hostName =
            process.env.GLOBAL_API_CONTAINER_NAME || "kodus-orchestrator";
    }

    if (params) {
        Object.keys(params).forEach((key) => {
            path = path.replace(`:${key}`, params[key]);
        });
    }

    const port = process.env.WEB_PORT_API;

    return createUrl(hostName, port, path, false);
}

export function pathToSlackApiUrl(path: API_ROUTES | string): string {
    invariant(path, "Api path doesn't exist");

    const hostName = process.env.GLOBAL_SLACK_HOSTNAME;
    const port = process.env.WEB_SLACK_PORT_API;

    return createUrl(hostName, port, path, false);
}

export function pathToDiscordApiUrl(path: API_ROUTES | string): string {
    invariant(path, "Api path doesn't exist");

    const serviceUrl = process.env.GLOBAL_KODUS_SERVICE_DISCORD;
    invariant(serviceUrl, "Discord service URL is not configured");

    return `${serviceUrl}${path}`;
}

export function createUrl(
    hostName?: string,
    port?: string,
    path?: string,
    https?: boolean,
): string {
    if (isProduction()) {
        https = true;
        port = "";
    }

    return `${https ? "https" : "http"}://${hostName}${
        port ? `:${port}` : ""
    }${path}`;
}

function isProduction() {
    return process.env.WEB_NODE_ENV === "production";
}

export function isJwtExpired(expirationDate?: number) {
    if (!expirationDate) return false;

    return +new Date() > expirationDate;
}

const getJwtSecretKey = () => {
    const secret = process.env.WEB_JWT_SECRET_KEY;

    if (!secret || secret.length === 0) {
        throw new Error(
            "The environment variable WEB_JWT_SECRET_KEY is not set.",
        );
    }

    return secret;
};

export function parseJwt(jwt?: string | null): ParsedJwt | null {
    if (!jwt) return null;

    try {
        const headers = decodeProtectedHeader(jwt);
        const payload = decodeJwt(jwt) as JwtPayload;

        if (!payload || !headers) {
            return null;
        }

        return { headers, payload, expired: isJwtExpired(payload.exp! * 1000) };
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
    const expectedKeys: (keyof CodeReviewRepositoryConfig)[] = [
        "id",
        "name",
        "automatedReviewActive",
        "baseBranches",
        "ignoredTitleKeywords",
        "ignorePaths",
        "reviewOptions",
        "kodusConfigFileOverridesWebPreferences",
        "pullRequestApprovalActive",
        "suggestionControl",
        "summary",
        "isRequestChangesActive",
        "kodyRulesGeneratorEnabled",
    ];

    expectedKeys.forEach((key) => {
        if (config.hasOwnProperty(key)) {
            newConfig[key] = config[key] as any;
        }
    });

    return newConfig;
};

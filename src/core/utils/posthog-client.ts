"use client";

import posthog from "posthog-js";

type PosthogEvent = {
    event: string;
    properties?: Record<string, unknown>;
    source?: string;
    page?: string;
};

type PosthogIdentify = {
    userId: string;
    email?: string | null;
    organizationId?: string | null;
};

type PendingAuthEvent = {
    method: string;
    createdAt: number;
};

const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "/ingest";
const PENDING_LOGIN_KEY = "posthog_pending_login";
const PENDING_SIGNUP_KEY = "posthog_pending_signup";
const PENDING_TTL_MS = 24 * 60 * 60 * 1000;

let initialized = false;

const getPosthogKey = () =>
    process.env.NEXT_PUBLIC_POSTHOG_KEY || process.env.WEB_POSTHOG_KEY;

const shouldCapture = () => {
    return typeof window !== "undefined" && !!getPosthogKey();
};

const safeStorageGet = (key: string) => {
    try {
        return window.localStorage.getItem(key);
    } catch {
        return null;
    }
};

const safeStorageSet = (key: string, value: string) => {
    try {
        window.localStorage.setItem(key, value);
    } catch {
        // Ignore storage failures (private mode, disabled storage).
    }
};

const safeStorageRemove = (key: string) => {
    try {
        window.localStorage.removeItem(key);
    } catch {
        // Ignore storage failures.
    }
};

const parsePendingEvent = (raw: string | null): PendingAuthEvent | null => {
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw) as PendingAuthEvent;
        if (!parsed?.method || !parsed?.createdAt) return null;
        return parsed;
    } catch {
        return null;
    }
};

export const initPosthog = () => {
    if (!shouldCapture() || initialized) return;

    const apiKey = getPosthogKey();
    if (!apiKey) return;

    posthog.init(apiKey, {
        api_host: POSTHOG_HOST,
        capture_pageview: false,
        autocapture: false,
    });

    if (typeof window !== "undefined") {
        (window as typeof window & { posthog?: typeof posthog }).posthog =
            posthog;
    }

    initialized = true;
};

export const capturePosthogEvent = ({
    event,
    properties,
    source = "front",
    page,
}: PosthogEvent) => {
    initPosthog();
    if (!initialized) return;

    const pagePath =
        page ?? (typeof window !== "undefined" ? window.location.pathname : "");
    const url =
        typeof window !== "undefined" ? window.location.href : undefined;

    posthog.capture(event, {
        ...properties,
        source,
        page: pagePath,
        url,
    });
};

export const identifyPosthogUser = ({
    userId,
    email,
    organizationId,
}: PosthogIdentify) => {
    if (!userId) return;
    initPosthog();
    if (!initialized) return;

    posthog.identify(userId, {
        email: email ?? undefined,
        organizationId: organizationId ?? undefined,
    });
};

export const queuePosthogAuthEvent = (
    type: "login" | "signup",
    method: string,
) => {
    if (!shouldCapture()) return;

    const payload: PendingAuthEvent = { method, createdAt: Date.now() };
    const key = type === "login" ? PENDING_LOGIN_KEY : PENDING_SIGNUP_KEY;
    safeStorageSet(key, JSON.stringify(payload));
};

export const flushPosthogAuthEvents = () => {
    if (!shouldCapture()) return;

    const now = Date.now();
    const pendingLogin = parsePendingEvent(safeStorageGet(PENDING_LOGIN_KEY));
    const pendingSignup = parsePendingEvent(safeStorageGet(PENDING_SIGNUP_KEY));

    if (pendingLogin && now - pendingLogin.createdAt < PENDING_TTL_MS) {
        capturePosthogEvent({
            event: "login",
            properties: { method: pendingLogin.method },
        });
    }

    if (pendingSignup && now - pendingSignup.createdAt < PENDING_TTL_MS) {
        capturePosthogEvent({
            event: "signup",
            properties: { method: pendingSignup.method },
        });
    }

    safeStorageRemove(PENDING_LOGIN_KEY);
    safeStorageRemove(PENDING_SIGNUP_KEY);
};

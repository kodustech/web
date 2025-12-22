import { PostHog } from "posthog-node";

import { auth } from "../config/auth";
import type { AwaitedReturnType } from "../types";

const PosthogServerSide = async <P>(promise: (instance: PostHog) => P) => {
    const apiKey = process.env.WEB_POSTHOG_KEY;
    if (!apiKey) {
        throw new Error("PostHog API key (WEB_POSTHOG_KEY) is not configured.");
    }

    const posthog = new PostHog(apiKey, {
        flushAt: 1,
        flushInterval: 0,
        host: "https://us.i.posthog.com",
    });

    try {
        return await promise(posthog);
    } finally {
        await posthog.shutdown();
    }
};

type ServerPosthogEvent = {
    event: string;
    distinctId?: string;
    properties?: Record<string, unknown>;
    source?: string;
    page?: string;
};

/**
 * **Usage *(SERVER-SIDE ONLY)***:
 * feature flags in client-side would flash, hydration errors would be thrown, page redirects could not be done
 * ```
 *  const feature1 = await getFeatureFlagWithPayload({ feature: "FEATURE-NAME-SET-IN-POSTHOG" });
 *  if(feature1?.value === 'VALUE-SET-IN-POSTHOG') doSomething();
 * ```
 * */
export const getFeatureFlagWithPayload = async ({
    feature,
}: {
    feature: string;
}): Promise<
    | {
          value: AwaitedReturnType<PostHog["getFeatureFlag"]>;
          payload: AwaitedReturnType<PostHog["getFeatureFlagPayload"]>;
      }
    | undefined
> => {
    // if no environment key is provided, there's no way to create Posthog client
    if (!process.env.WEB_POSTHOG_KEY) return undefined;

    const jwtPayload = await auth();
    const userId = jwtPayload?.user.userId;

    // if no user is provided, there's no way to get feature flag
    if (!userId) return undefined;

    return PosthogServerSide(async (p) => {
        const [value, payload] = await Promise.all([
            p.getFeatureFlag(feature, userId).catch(() => undefined),
            p.getFeatureFlagPayload(feature, userId).catch(() => undefined),
        ]);

        // if no value was provided, it doesn't exists so it also has no payload
        if (value === undefined) return undefined;

        return { value, payload };
    });
};

export const capturePosthogServerEvent = async ({
    event,
    distinctId,
    properties,
    source = "back",
    page,
}: ServerPosthogEvent) => {
    const apiKey = process.env.WEB_POSTHOG_KEY;
    if (!apiKey) return;

    const userId = distinctId ?? (await auth())?.user.userId;
    if (!userId) return;

    await PosthogServerSide(async (p) => {
        const pageProperty = page ? { page } : {};
        p.capture({
            distinctId: userId,
            event,
            properties: {
                ...properties,
                source,
                ...pageProperty,
            },
        });
    });
};

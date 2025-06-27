import { PostHog } from "posthog-node";
import { getJwtPayload } from "src/lib/auth/utils";

export const PosthogServerSide = async <P>(
    promise: (instance: PostHog) => P,
) => {
    const posthog = new PostHog(process.env.WEB_POSTHOG_KEY!, {
        flushAt: 1,
        flushInterval: 0,
        host: "https://us.i.posthog.com",
    });

    const response = await promise(posthog);
    await posthog.shutdown();
    return response;
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
          value: Awaited<ReturnType<PostHog["getFeatureFlag"]>>;
          payload: Awaited<ReturnType<PostHog["getFeatureFlagPayload"]>>;
      }
    | undefined
> => {
    // if no environment key is provided, there's no way to create Posthog client
    if (!process.env.WEB_POSTHOG_KEY) return undefined;

    const jwtPayload = await getJwtPayload();
    const userId = jwtPayload?.sub;

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

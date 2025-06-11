import posthog from "posthog-js";

posthog?.init(process.env.WEB_POSTHOG_KEY!, {
    api_host: "https://us.i.posthog.com",
    capture_pageview: "history_change",
});

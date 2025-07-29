import { CustomMessages } from "./custom-messages";
import { General } from "./general";
import { KodyRules } from "./kody-rules";
import { PRSummary } from "./pr-summary";
import { SuggestionControl } from "./suggestion-limit";
import type { AutomationCodeReviewConfigPageProps } from "./types";

export default {
    "general": General,
    "suggestion-control": SuggestionControl,
    "pr-summary": PRSummary,
    "kody-rules": KodyRules,
    "custom-messages": CustomMessages,
} satisfies Record<
    string,
    (
        props: AutomationCodeReviewConfigPageProps,
    ) => React.JSX.Element | Promise<React.JSX.Element>
>;

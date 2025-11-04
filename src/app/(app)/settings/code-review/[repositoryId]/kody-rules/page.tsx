import { getFeatureFlagWithPayload } from "src/core/utils/posthog-server-side";
import { FEATURE_FLAGS } from "src/core/config/feature-flags";

import { KodyRulesPage } from "./_components/_page";

export default async function KodyRules() {
    const suggestionsFeatureFlag = await getFeatureFlagWithPayload({
        feature: FEATURE_FLAGS.kodyRuleSuggestions,
    });

    return (
        <KodyRulesPage
            showSuggestionsButton={suggestionsFeatureFlag?.value === true}
        />
    );
}

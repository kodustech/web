import { listCLIKeys } from "@services/cliKeys/fetch";
import type { CLIKey } from "@services/cliKeys/types";
import { FEATURE_FLAGS } from "src/core/config/feature-flags";
import { getGlobalSelectedTeamId } from "src/core/utils/get-global-selected-team-id";
import { isFeatureEnabled } from "src/core/utils/posthog-server-side";

import { CliKeysPage } from "./_page-component";

export default async function CliKeysSettingsPage() {
    const cliKeysFeatureFlag = await isFeatureEnabled({
        feature: FEATURE_FLAGS.cliKeys,
    });

    if (!cliKeysFeatureFlag) {
        return null;
    }

    const teamId = await getGlobalSelectedTeamId();

    let cliKeys: CLIKey[] = [];

    try {
        cliKeys = await listCLIKeys(teamId);
    } catch (error) {
        console.error("Failed to load CLI keys", error);
    }

    return <CliKeysPage teamId={teamId} initialKeys={cliKeys} />;
}

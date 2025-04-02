import { getLibraryKodyRules } from "@services/kodyRules/fetch";
import { getTeamParameters } from "@services/parameters/fetch";
import { ParametersConfigKey } from "@services/parameters/types";
import { getGlobalSelectedTeamId } from "src/core/utils/get-global-selected-team-id";

import { KodyRulesLibrary } from "./_components/_page";

export default async function Route() {
    const libraryRules = await getLibraryKodyRules();
    const teamId = await getGlobalSelectedTeamId();

    const { configValue } = await getTeamParameters<{
        configValue: { repositories: Array<{ id: string; name: string }> };
    }>({
        key: ParametersConfigKey.CODE_REVIEW_CONFIG,
        teamId,
    });

    return <KodyRulesLibrary rules={libraryRules} configValue={configValue} />;
}

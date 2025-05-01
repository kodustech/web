import { getLibraryKodyRules } from "@services/kodyRules/fetch";
import { LibraryRule } from "@services/kodyRules/types";
import { getTeamParameters } from "@services/parameters/fetch";
import { ParametersConfigKey } from "@services/parameters/types";
import { getAllRulesWithLikes } from "@services/ruleLike/fetch";
import { RuleLike } from "@services/ruleLike/types";
import { getGlobalSelectedTeamId } from "src/core/utils/get-global-selected-team-id";

import { KodyRulesLibrary } from "./_components/_page";

export default async function Route() {
    const [rules, rulesWithLikes] = await Promise.all([
        getLibraryKodyRules(),
        getAllRulesWithLikes()
    ]);

    const teamId = await getGlobalSelectedTeamId();

    const { configValue } = await getTeamParameters<{
        configValue: { repositories: Array<{ id: string; name: string }> };
    }>({
        key: ParametersConfigKey.CODE_REVIEW_CONFIG,
        teamId,
    });

    return (
        <KodyRulesLibrary
            rules={rules ?? []}
            rulesWithLikes={rulesWithLikes ?? []}
            configValue={configValue}
        />
    );
}

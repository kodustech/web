import { getTeamsFlowMetrics } from "@services/metrics/fetch";
import { getTeams } from "@services/teams/fetch";
import { getGlobalSelectedTeamId } from "src/core/utils/get-global-selected-team-id";

import FlowMetricsTabs from "../_components/flow-metrics-tabs";
import { getSelectedDateRange } from "../_helpers/get-selected-date-range";

export default async function FlowMetricsTab() {
    const [selectedTeamId, selectedDateRange, teams] = await Promise.all([
        getGlobalSelectedTeamId(),
        getSelectedDateRange(),
        getTeams(),
    ]);

    const selectedTeam = teams?.find((t) => t.uuid === selectedTeamId)!;
    const flowMetrics =
        (await getTeamsFlowMetrics(selectedTeamId))?.filter(
            (metric) => metric, // remove null values
        ) ?? [];

    return (
        <FlowMetricsTabs
            flowMetrics={flowMetrics}
            selectedTeam={selectedTeam}
            selectedDateRange={selectedDateRange}
        />
    );
}

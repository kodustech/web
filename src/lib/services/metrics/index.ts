import { pathToApiUrl } from "src/core/utils/helpers";

export const FLOW_METRICS_PATH = {
    GET_ORGANIZATION_FLOW_METRICS: pathToApiUrl(
        "/organization-metrics/get-cockpit-data",
    ),
    GET_TEAM_FLOW_METRICS: pathToApiUrl("/metrics/get-cockpit-data"),
    GET_ORGANIZATION_CHART_FLOW_DATA: pathToApiUrl(
        "/metrics/get-by-organization-id",
    ),
    GET_TEAM_CHART_FLOW_DATA: pathToApiUrl("/metrics/get-by-team-id"),
} as const;

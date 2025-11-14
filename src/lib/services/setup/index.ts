import { pathToApiUrl } from "src/core/utils/helpers";

export const SETUP_PATHS = {
    GITHUB_ORGANIZATION_NAME: pathToApiUrl("/github/organization-name"),
    GITHUB_INTEGRATION: pathToApiUrl("/github/integration"),
    TEAM_MEMBERS: pathToApiUrl("/team-members/"),
    TEAM_MEMBERS_PREDICT_TEAM: pathToApiUrl("/team-members/predict-team"), // TODO: remove, unused
    CONNECTIONS: pathToApiUrl("/integration/connections"),

    INTEGRATION_PLATFORMS: pathToApiUrl("/integration/platforms"), // TODO: remove, unused
    TEAM_MEMBERS_ORGANIZATION_AND_TEAM: pathToApiUrl(
        "/team-members/organization",
    ), // TODO: remove, unused
    CODE_MANAGEMENT_MEMBERS: pathToApiUrl("/codeManagement"), // TODO: remove, unused
    VERIFY_CONNECTION_COMMUNICATION: pathToApiUrl(
        "/communication/verify-connection",
    ), // TODO: remove, unused
    GET_TEAM_INFOS_BY_TENANT_NAME_AND_TEAM_NAME:
        pathToApiUrl("/team/team-infos"), // TODO: remove, unused
} as const;

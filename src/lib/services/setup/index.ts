import { pathToApiUrl } from "src/core/utils/helpers";

export const SETUP_PATHS = {
    USER_INFOS: pathToApiUrl("/user/infos"),
    GITHUB_ORGANIZATION_NAME: pathToApiUrl("/github/organization-name"),
    GITHUB_INTEGRATION: pathToApiUrl("/github/integration"),
    TEAM_MEMBERS: pathToApiUrl("/team-members/"),
    TEAM_MEMBERS_PREDICT_TEAM: pathToApiUrl("/team-members/predict-team"),
    TEAM_AUTOMATION: pathToApiUrl("/team-automation"),
    CONNECTIONS: pathToApiUrl("/integration/connections"),

    INTEGRATION_PLATFORMS: pathToApiUrl("/integration/platforms"),
    TEAM_MEMBERS_ORGANIZATION_AND_TEAM: pathToApiUrl(
        "/team-members/organization",
    ),
    CODE_MANAGEMENT_MEMBERS: pathToApiUrl("/codeManagement"),
    VERIFY_CONNECTION_COMMUNICATION: pathToApiUrl(
        "/communication/verify-connection",
    ),
    MSTEAMS_STORY_URL: pathToApiUrl("/msteams/story-url"),
    GET_TEAM_INFOS_BY_TENANT_NAME_AND_TEAM_NAME:
        pathToApiUrl("/team/team-infos"),
} as const;

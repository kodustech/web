import { pathToApiUrl } from "src/core/utils/helpers";

export interface IGetWorkflowsResponseData {
    repo: string;
    productionWorkflows: Array<{ id: string; name: string }>;
}

export type Repository = {
    avatar_url: string;
    default_branch: string;
    http_url: string;
    id: string;
    name: string;
    full_name: string;
    language: string;
    organizationName: string;
    visibility: string;
    workspaceId?: string;
    project?: {
        id?: string;
        name?: string;
    };
    selected?: boolean;
};

export type GitFileOrFolder = {
    name: string;
    path: string;
    files?: GitFileOrFolder[];
    subdirectories?: GitFileOrFolder[];
};

export const CODE_MANAGEMENT_API_PATHS = {
    GET_ONBOARDING_CODE_REVIEW_STATUS: pathToApiUrl(
        "/code-management/get-code-review-started",
    ),
    GET_ONBOARDING_PULL_REQUESTS: pathToApiUrl("/code-management/get-prs"),
    REVIEW_ONBOARDING_PULL_REQUEST: pathToApiUrl("/code-management/review-pr"),

    GET_REPOSITORIES_ORG: pathToApiUrl("/code-management/repositories/org"),
    VERIFY_CONNECTION: pathToApiUrl("/code-management/verify"),
    CREATE_OR_UPDATE_REPOSITORIES_CONFIG: pathToApiUrl(
        "/code-management/repositories",
    ),
    CREATE_AUTH_INTEGRATION: pathToApiUrl("/code-management/auth-integration"),
    LIST_MEMBERS: pathToApiUrl("/code-management/list-members"),
    GET_ORGANIZATIONS: pathToApiUrl("/code-management/organizations"),
    CODE_MANAGEMENT_CONFIG_UPDATE: pathToApiUrl("/code-management/config"),
    SAVE_PAT: pathToApiUrl("/code-management/save-personal-token"),
    GET_PAT_TOKEN: pathToApiUrl("/code-management/get-personal-token"),
    GET_WORKFLOWS: pathToApiUrl("/code-management/get-workflows"),

    FINISH_ONBOARDING: pathToApiUrl("/code-management/finish-onboarding"),
    DELETE_INTEGRATION: pathToApiUrl("/code-management/delete-integration"),
    DELETE_INTEGRATION_AND_REPOSITORIES: pathToApiUrl("/code-management/delete-integration-and-repositories"),
} as const;

export const AZURE_REPOS_API_PATHS = {} as const;

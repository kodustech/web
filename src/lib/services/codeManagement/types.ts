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
    GET_ONBOARDING_PULL_REQUESTS: pathToApiUrl("/code-management/get-prs"),
    GET_REPOSITORIES_ORG: pathToApiUrl("/code-management/repositories/org"),
    CREATE_OR_UPDATE_REPOSITORIES_CONFIG: pathToApiUrl(
        "/code-management/repositories",
    ),
    CREATE_AUTH_INTEGRATION: pathToApiUrl("/code-management/auth-integration"),
    FINISH_ONBOARDING: pathToApiUrl("/code-management/finish-onboarding"),
    DELETE_INTEGRATION: pathToApiUrl("/code-management/delete-integration"),
    DELETE_INTEGRATION_AND_REPOSITORIES: pathToApiUrl(
        "/code-management/delete-integration-and-repositories",
    ),
} as const;

export const AZURE_REPOS_API_PATHS = {} as const;

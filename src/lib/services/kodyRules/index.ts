import { pathToApiUrl } from "src/core/utils/helpers";

export const KODY_RULES_PATHS = {
    CREATE_OR_UPDATE: pathToApiUrl("/kody-rules/create-or-update"),
    FIND_BY_ORGANIZATION_ID: pathToApiUrl(
        "/kody-rules/find-by-organization-id",
    ),
    FIND_BY_ORGANIZATION_ID_AND_FILTER: pathToApiUrl(
        "/kody-rules/find-rules-in-organization-by-filter",
    ),
    DELETE_BY_ORGANIZATION_ID_AND_ROLE_UUID: pathToApiUrl(
        "/kody-rules/delete-rule-in-organization-by-id",
    ),
    FIND_LIBRARY_KODY_RULES: pathToApiUrl(
        "/kody-rules/find-library-kody-rules",
    ),
    FIND_LIBRARY_KODY_RULES_WITH_FEEDBACK: pathToApiUrl(
        "/kody-rules/find-library-kody-rules-with-feedback",
    ),
    FIND_LIBRARY_KODY_RULES_BUCKETS: pathToApiUrl(
        "/kody-rules/find-library-kody-rules-buckets",
    ),
    ADD_LIBRARY_KODY_RULES: pathToApiUrl("/kody-rules/add-library-kody-rules"),
    CHANGE_STATUS_KODY_RULES: pathToApiUrl(
        "/kody-rules/change-status-kody-rules",
    ),
    GENERATE_KODY_RULES: pathToApiUrl("/kody-rules/generate-kody-rules"),
    SYNC_IDE_RULES: pathToApiUrl("/kody-rules/sync-ide-rules"),
    CHECK_SYNC_STATUS: pathToApiUrl("/kody-rules/check-sync-status"),
    GET_INHERITED_RULES: pathToApiUrl("/kody-rules/inherited-rules"),
} as const;

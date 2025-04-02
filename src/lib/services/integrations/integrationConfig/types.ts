export type IntegrationConfig = {
    configKey: string;
    configValue: any;
};

export enum IntegrationConfigKeyProjectManagement {
    USE_JQL_TO_VIEW_BOARD = "use_jql_to_view_board",
    MODULE_WORKITEMS_TYPES = "module_workitems_types",
    BUG_TYPE_IDENTIFIERS = "bug_type_identifier",
    TEAM_PROJECT_MANAGEMENT_METHODOLOGY = "team_project_management_methodology",
    WAITING_COLUMNS = "waiting_columns",
    DOING_COLUMN = "doing_column",
}

export interface WorkItemType {
    id: string;
    name: string;
    subtask: boolean;
    description: string;
}

export enum MODULE_WORKITEMS_TYPES {
    DEFAULT = "default",
    IMPROVE_TASK_DESCRIPTION = "automation__improve_task_description",
}

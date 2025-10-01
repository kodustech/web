export type IntegrationConfig = {
    configKey: string;
    configValue: any;
};

export interface WorkItemType {
    id: string;
    name: string;
    subtask: boolean;
    description: string;
}

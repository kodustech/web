"use client";

import { useEffect, useMemo, useState } from "react";
import AutoComplete from "@components/system/autoComplete";
import { Button } from "@components/ui/button";
import { FormControl } from "@components/ui/form-control";
import Loading from "@components/ui/loading";
import { Page } from "@components/ui/page";
import { Textarea } from "@components/ui/textarea";
import { toast } from "@components/ui/toaster/use-toast";
import { createOrUpdateIntegrationConfig } from "@services/integrations/integrationConfig/fetch";
import { getIntegrationConfigsByCategory } from "@services/integrations/integrationConfig/hooks";
import {
    IntegrationConfig,
    IntegrationConfigKeyProjectManagement,
    MODULE_WORKITEMS_TYPES,
    WorkItemType,
} from "@services/integrations/integrationConfig/types";
import {
    createOrUpdateParameter,
    getParameterByKey,
} from "@services/parameters/fetch";
import {
    BoardPriorityType,
    ParametersConfigKey,
} from "@services/parameters/types";
import {
    useGetColumns,
    useGetWorkItemTypes,
} from "@services/projectManagement/hooks";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";
import { IntegrationCategory } from "src/core/types";

const ERROR_MESSAGES = {
    loadTeamIntegrationConfigs: "Error retrieving team integrations.",
    loadUpdateIntegrationConfigs: "Error updating project tool configurations.",
};

interface SelectItem {
    label: string;
    value: string;
}

interface WorkItemTypesSelect {
    name: string;
    workItemTypes: SelectItem[];
}

export default function ProjectManagementConfigPage() {
    const { teamId } = useSelectedTeamId();

    const {
        data: projectManagementConfigs,
        isLoading: isLoadingTeamIntegrationConfig,
    } = getIntegrationConfigsByCategory(
        teamId,
        IntegrationCategory.PROJECT_MANAGEMENT,
    );

    const [isLoadingSubmitButton, setIsLoadingSubmitButton] = useState(false);

    const stableProjectManagementConfigs = useMemo(
        () => projectManagementConfigs,
        [projectManagementConfigs],
    );

    const [useJQLtoViewBoard, setUseJQLtoViewBoard] =
        useState<IntegrationConfig>();

    const { data: projectManagementColumns, isLoading: isLoadingColumns } =
        useGetColumns(teamId);

    const stableProjectManagementColumns = useMemo(
        () => projectManagementColumns,
        [projectManagementColumns],
    );

    const [columns, setColumns] = useState<SelectItem[]>();

    const [waitingColumns, setWaitingColumns] = useState<IntegrationConfig>();

    const [doingColumn, setDoingColumn] = useState<IntegrationConfig>();

    const [bugTypeIdentifiers, setBugTypeIdentifiers] =
        useState<IntegrationConfig>();

    const [defaultWorkItemTypes, setDefaultWorkItemTypes] =
        useState<WorkItemTypesSelect>();

    const [
        improveTaskDescriptionWorkItemTypes,
        setImproveTaskDescriptionWorkItemTypes,
    ] = useState<WorkItemTypesSelect>();

    const [boardPriorityType, setBoardPriorityType] =
        useState<IntegrationConfig>();

    const [
        isLoadingUpdateBoardPriorityType,
        setIsLoadingUpdateBoardPriorityType,
    ] = useState(false);

    const boardPriorityOptions = Object.entries(BoardPriorityType).map(
        ([key, value]) => ({
            label: value,
            value: value,
        }),
    );

    const {
        data: projectManagementWorkItemTypes,
        isLoading: isLoadingWorkItemTypes,
    } = useGetWorkItemTypes(teamId);
    const stableProjectManagementWorkItemTypes = useMemo(
        () => projectManagementWorkItemTypes,
        [projectManagementWorkItemTypes],
    );

    const [workItemTypes, setWorkItemTypes] = useState<SelectItem[]>();

    useEffect(() => {
        const fetchBoardPriorityType = async () => {
            setIsLoadingUpdateBoardPriorityType(true);
            try {
                const boardPriorityType = await getParameterByKey(
                    ParametersConfigKey.BOARD_PRIORITY_TYPE,
                    teamId,
                );

                setBoardPriorityType({
                    configKey: ParametersConfigKey.BOARD_PRIORITY_TYPE,
                    configValue: boardPriorityType.configValue.map(
                        ({ priorityType }: { priorityType: string }) => ({
                            label: priorityType,
                            value: priorityType,
                        }),
                    ),
                });
            } catch (err) {
                console.error("Erro ao buscar boardPriorityType: ", err);
                toast({
                    title: "Error",
                    description: "Error retrieving boardPriorityType",
                    variant: "danger",
                });
            } finally {
                setIsLoadingUpdateBoardPriorityType(false);
            }
        };

        fetchBoardPriorityType();
        setIsLoadingUpdateBoardPriorityType(false);
    }, [teamId]);

    const handleBoardPriorityTypeChange = async (value: any) => {
        setBoardPriorityType({
            configKey: ParametersConfigKey.BOARD_PRIORITY_TYPE,
            configValue: [value],
        });
    };

    const handleUpdateParametersConfig = async (
        key: string,
        configValue: any,
        teamId: string,
    ) => {
        try {
            setIsLoadingUpdateBoardPriorityType(true);

            const response = await createOrUpdateParameter(
                key,
                configValue,
                teamId,
            );

            if (response?.error) {
                toast({
                    title: "Error",
                    description: "Error retrieving board priority parameter:",
                    variant: "danger",
                });
            }
        } catch (err) {
            toast({
                title: "Error",
                description: "Error retrieving board priority parameter:",
                variant: "danger",
            });
            console.error(err);
        } finally {
            setIsLoadingUpdateBoardPriorityType(false);
        }
    };

    function handleUpdateWaitingColumns(selectedColumns: any) {
        setWaitingColumns({
            configKey: IntegrationConfigKeyProjectManagement.WAITING_COLUMNS,
            configValue: selectedColumns,
        });
    }

    function handleUpdateDoingColumn(selectedColumn: any) {
        setDoingColumn({
            configKey: IntegrationConfigKeyProjectManagement.DOING_COLUMN,
            configValue: selectedColumn,
        });
    }

    function handleUpdateBugTypeIdentifier(selectedBugTypeIdentifiers: any) {
        setBugTypeIdentifiers({
            configKey:
                IntegrationConfigKeyProjectManagement.BUG_TYPE_IDENTIFIERS,
            configValue: selectedBugTypeIdentifiers,
        });
    }

    function handleUpdateDefaultWorkItemTypes(selectedWorkItemTypes: any) {
        setDefaultWorkItemTypes((prevState) => ({
            name: prevState?.name || "",
            workItemTypes: selectedWorkItemTypes,
        }));
    }

    function handleUpdateImproveTaskDescriptionWorkItemTypes(
        selectedWorkItemTypes: any,
    ) {
        setImproveTaskDescriptionWorkItemTypes((prevState) => ({
            name: prevState?.name || "",
            workItemTypes: selectedWorkItemTypes,
        }));
    }

    useEffect(() => {
        if (stableProjectManagementColumns && !isLoadingColumns) {
            setColumns(
                stableProjectManagementColumns.columns.map((column) => {
                    return {
                        label: column.name,
                        value: column.id,
                    };
                }),
            );
        }
    }, [stableProjectManagementColumns, isLoadingColumns]);

    useEffect(() => {
        if (stableProjectManagementWorkItemTypes && !isLoadingWorkItemTypes) {
            setWorkItemTypes(
                stableProjectManagementWorkItemTypes.map(
                    ({ name, id, ...rest }) => {
                        return {
                            label: name,
                            value: id,
                            ...rest,
                        };
                    },
                ),
            );
        }
    }, [stableProjectManagementWorkItemTypes, isLoadingWorkItemTypes]);

    useEffect(() => {
        if (projectManagementConfigs) {
            setWaitingColumns(
                getConfigByKey(
                    projectManagementConfigs,
                    IntegrationConfigKeyProjectManagement.WAITING_COLUMNS,
                ),
            );
            setDoingColumn(
                getConfigByKey(
                    projectManagementConfigs,
                    IntegrationConfigKeyProjectManagement.DOING_COLUMN,
                ),
            );
            setBugTypeIdentifiers(
                getConfigByKey(
                    projectManagementConfigs,
                    IntegrationConfigKeyProjectManagement.BUG_TYPE_IDENTIFIERS,
                ),
            );
            setDefaultWorkItemTypes(
                getWorkItemTypesByConfigKeyAndType(
                    projectManagementConfigs,
                    MODULE_WORKITEMS_TYPES.DEFAULT,
                ),
            );
            setImproveTaskDescriptionWorkItemTypes(
                getWorkItemTypesByConfigKeyAndType(
                    projectManagementConfigs,
                    MODULE_WORKITEMS_TYPES.IMPROVE_TASK_DESCRIPTION,
                ),
            );
            const parameterConfigUseJQLtoViewBoard =
                stableProjectManagementConfigs.find(
                    (projectManagementConfig) =>
                        projectManagementConfig.configKey ===
                        IntegrationConfigKeyProjectManagement.USE_JQL_TO_VIEW_BOARD,
                );

            setUseJQLtoViewBoard(parameterConfigUseJQLtoViewBoard);
        }
    }, [projectManagementConfigs]);

    const getConfigByKey = (
        configs: IntegrationConfig[],
        key: IntegrationConfigKeyProjectManagement,
    ) => {
        const config = configs.find((config) => config.configKey === key);

        if (config) {
            if (Array.isArray(config.configValue)) {
                return {
                    configKey: key,
                    configValue: config.configValue.map(
                        ({ id, name }: { id: string; name: string }) => ({
                            label: name,
                            value: id,
                        }),
                    ),
                };
            } else {
                const updatedConfig = {
                    configKey: key,
                    configValue: {
                        label: config.configValue.name,
                        value: config.configValue.id,
                    },
                };
                return updatedConfig;
            }
        }
        return undefined;
    };

    const returnConfigToRegularShape = (config?: IntegrationConfig) => {
        if (config) {
            const { configKey, configValue } = config;

            if (Array.isArray(config.configValue)) {
                return {
                    configKey: configKey,
                    configValue: configValue.map(
                        ({
                            label,
                            value,
                        }: {
                            label: string;
                            value: string;
                        }) => ({ name: label, id: value }),
                    ),
                };
            } else {
                return {
                    configKey: configKey,
                    configValue: {
                        id: configValue.value,
                        name: configValue.label,
                    },
                };
            }
        }
    };

    const mapWorkItemTypes = (workItemTypes: WorkItemTypesSelect) => {
        return workItemTypes.workItemTypes.map(({ label, value, ...rest }) => ({
            id: value,
            name: label,
            ...rest,
        }));
    };

    const createModuleWorkItemTypes = (
        defaultWorkItemTypes?: WorkItemTypesSelect,
        improveTaskDescriptionWorkItemTypes?: WorkItemTypesSelect,
    ): IntegrationConfig | undefined => {
        if (!defaultWorkItemTypes || !improveTaskDescriptionWorkItemTypes) {
            return undefined;
        }

        return {
            configKey:
                IntegrationConfigKeyProjectManagement.MODULE_WORKITEMS_TYPES,
            configValue: [
                {
                    name: defaultWorkItemTypes.name,
                    workItemTypes: mapWorkItemTypes(defaultWorkItemTypes),
                },
                {
                    name: improveTaskDescriptionWorkItemTypes.name,
                    workItemTypes: mapWorkItemTypes(
                        improveTaskDescriptionWorkItemTypes,
                    ),
                },
            ],
        };
    };

    const getWorkItemTypesByConfigKeyAndType = (
        configs: IntegrationConfig[],
        moduleWorkItemsType: MODULE_WORKITEMS_TYPES,
    ) => {
        const config = configs.find(
            (config) =>
                config.configKey ===
                IntegrationConfigKeyProjectManagement.MODULE_WORKITEMS_TYPES,
        );

        if (config) {
            const filteredConfigValue: {
                name: string;
                workItemTypes: WorkItemType[];
            } = config.configValue.find(
                (configValue: any) => configValue.name === moduleWorkItemsType,
            );

            return {
                name: filteredConfigValue.name,
                workItemTypes: filteredConfigValue?.workItemTypes?.map(
                    ({ id, name, ...rest }) => ({
                        label: name,
                        value: id,
                        ...rest,
                    }),
                ),
            };
        }
        return undefined;
    };

    const handleUseJQLtoViewBoardConfigChange = (newValue: string) => {
        setUseJQLtoViewBoard({
            configKey:
                IntegrationConfigKeyProjectManagement.USE_JQL_TO_VIEW_BOARD,
            configValue: newValue,
        });
    };

    const haveCommonElements = (waitingColumns: any[], doingColumn: any) => {
        return waitingColumns.some(
            (waitingColumn) => waitingColumn.value == doingColumn.value,
        );
    };

    const handleUpdateIntegrationConfig = async () => {
        try {
            setIsLoadingSubmitButton(true);
            toast({
                title: "Updating",
                description: "Settings are being updated...",
                variant: "default",
            });

            validateConfigurations();

            const updatedIntegrationConfigs: Array<{
                configKey: string;
                configValue: any;
            }> = [
                useJQLtoViewBoard?.configValue != ""
                    ? useJQLtoViewBoard
                    : undefined,
                returnConfigToRegularShape(waitingColumns),
                returnConfigToRegularShape(doingColumn),
                returnConfigToRegularShape(bugTypeIdentifiers),
                createModuleWorkItemTypes(
                    defaultWorkItemTypes,
                    improveTaskDescriptionWorkItemTypes,
                ),
            ].filter((config) => config !== undefined);

            const response = await createOrUpdateIntegrationConfig(
                updatedIntegrationConfigs,
                teamId,
                IntegrationCategory.PROJECT_MANAGEMENT,
            );

            if (response?.error) {
                toast({
                    title: "Error",
                    description: ERROR_MESSAGES.loadUpdateIntegrationConfigs,
                    variant: "danger",
                });
            }

            if (response?.success) {
                toast({
                    title: "Success",
                    description:
                        "Project management settings successfully updated",
                    variant: "default",
                });
            }
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message
                    ? err.message
                    : ERROR_MESSAGES.loadTeamIntegrationConfigs,
                variant: "danger",
            });
            console.error(err);
        } finally {
            setIsLoadingSubmitButton(false);
        }

        const formattedBoardPriorityType = boardPriorityType?.configValue?.map(
            ({ label, value }: { label: string; value: string }) => ({
                priorityType: value,
            }),
        );

        await handleUpdateParametersConfig(
            ParametersConfigKey.BOARD_PRIORITY_TYPE,
            formattedBoardPriorityType,
            teamId,
        );

        setIsLoadingSubmitButton(false);
    };

    function validateConfigurations() {
        if (
            haveCommonElements(
                waitingColumns?.configValue,
                doingColumn?.configValue,
            )
        ) {
            throw new Error(
                "Columns cannot belong to multiple categories (e.g., waiting and in progress).",
            );
        }
        if (waitingColumns?.configValue.length < 1) {
            throw new Error("Select at least one waiting column.");
        }
        if (doingColumn?.configValue.length < 1) {
            throw new Error("Select at least one in progress column.");
        }
        if (bugTypeIdentifiers?.configValue.length < 1) {
            throw new Error("Select at least one identifier for bugs.");
        }
        if (
            defaultWorkItemTypes &&
            defaultWorkItemTypes?.workItemTypes.length < 1
        ) {
            throw new Error(
                "Select at least one item identifier type (default).",
            );
        }
        if (
            improveTaskDescriptionWorkItemTypes &&
            improveTaskDescriptionWorkItemTypes?.workItemTypes.length < 1
        ) {
            throw new Error(
                "Select at least one item identifier type (Task Description Improvement).",
            );
        }
    }

    const autoCompleteFields = [
        {
            label: "Board Priority Type",
            description:
                "Select the priority type to be applied to the board items.",
            data: boardPriorityOptions,
            onChange: handleBoardPriorityTypeChange,
            placeholder: "Board priority type",
            value: boardPriorityType?.configValue,
            isLoading: isLoadingUpdateBoardPriorityType,
            isMulti: false,
            isSearchable: false,
        },
        {
            label: "Waiting Columns",
            description: "Choose the columns that contain items in waiting",
            data: columns ? columns : [],
            onChange: handleUpdateWaitingColumns,
            placeholder: "Selected waiting columns",
            value: waitingColumns?.configValue,
            isLoading: isLoadingColumns,
            isMulti: true,
            isSearchable: false,
        },
        {
            label: "In Progress Columns",
            description: "Choose the columns that contain items in progress",
            data: columns ? columns : [],
            onChange: handleUpdateDoingColumn,
            placeholder: "Selected In Progress columns",
            value: doingColumn?.configValue,
            isLoading: isLoadingColumns,
            isMulti: false,
            isSearchable: false,
        },
        {
            label: "Bug Identifiers",
            description: "Choose the items used as bug identifiers",
            data: workItemTypes ? workItemTypes : [],
            onChange: handleUpdateBugTypeIdentifier,
            placeholder: "Selected bug identifiers",
            value: bugTypeIdentifiers?.configValue,
            isLoading: isLoadingWorkItemTypes,
            isMulti: true,
            isSearchable: false,
        },
        {
            label: "Item Types (Default)",
            description: "Choose the default item types",
            data: workItemTypes ? workItemTypes : [],
            onChange: handleUpdateDefaultWorkItemTypes,
            placeholder: "Selected item types (default)",
            value: defaultWorkItemTypes?.workItemTypes,
            isLoading: isLoadingWorkItemTypes,
            isMulti: true,
            isSearchable: false,
        },
        {
            label: "Item Types (Task Description Improvement)",
            description:
                "Choose the items used as task description improvement identifiers",
            data: workItemTypes ? workItemTypes : [],
            onChange: handleUpdateImproveTaskDescriptionWorkItemTypes,
            placeholder: "Selected item types (Task Description Improvement)",
            value: improveTaskDescriptionWorkItemTypes?.workItemTypes,
            isLoading: isLoadingWorkItemTypes,
            isMulti: true,
            isSearchable: false,
        },
    ];

    return (
        <Page.Root>
            <Page.Header>
                <div>
                    <Page.Title>Project Tool Settings</Page.Title>
                    <p className="text-text-secondary text-sm">
                        Here you can customize your project tool settings.
                    </p>
                </div>

                <Button
                    className="mt-4"
                    size="md"
                    variant="primary"
                    loading={isLoadingSubmitButton}
                    onClick={async () => handleUpdateIntegrationConfig()}>
                    Update settings
                </Button>
            </Page.Header>

            <Page.Content>
                <div>
                    {isLoadingTeamIntegrationConfig ? (
                        <div className="flex h-full flex-col items-center justify-center">
                            <Loading />
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col gap-10">
                                <div className="flex flex-col gap-10">
                                    {autoCompleteFields.map((field, index) => (
                                        <div key={index}>
                                            <p className="font-bold">
                                                {field.label}
                                            </p>
                                            <p className="mb-3 text-sm text-[#DFD8F5]">
                                                {field.description}
                                            </p>
                                            <AutoComplete
                                                data={field.data}
                                                onChange={field.onChange}
                                                placeholder={field.placeholder}
                                                value={field.value}
                                                isLoading={field.isLoading}
                                                isMulti={field.isMulti}
                                                isSearchable={
                                                    field.isSearchable
                                                }
                                            />
                                        </div>
                                    ))}
                                </div>
                                {useJQLtoViewBoard ? (
                                    <FormControl.Root>
                                        <FormControl.Label htmlFor="jql">
                                            JQL Filter
                                        </FormControl.Label>

                                        <FormControl.Helper className="mt-0 mb-1.5">
                                            When configured, the JQL filter is
                                            applied to the return of your team's
                                            work items.
                                        </FormControl.Helper>

                                        <FormControl.Input>
                                            <Textarea
                                                id="jql"
                                                value={
                                                    useJQLtoViewBoard.configValue
                                                }
                                                placeholder={`component IN ('Distribution', 'Export/Import') \n AND issuetype IN ('Bug', 'History') `}
                                                rows={6}
                                                onChange={(e) =>
                                                    handleUseJQLtoViewBoardConfigChange(
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </FormControl.Input>
                                    </FormControl.Root>
                                ) : (
                                    <div>
                                        No configuration found for the team.
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </Page.Content>
        </Page.Root>
    );
}

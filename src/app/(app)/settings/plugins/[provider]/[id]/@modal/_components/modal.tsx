"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MCPPluginsLimitPopover } from "@components/system/mcp-plugins-limit-popover";
import { Avatar, AvatarImage } from "@components/ui/avatar";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Checkbox } from "@components/ui/checkbox";
import { ConfirmModal } from "@components/ui/confirm-modal";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@components/ui/dialog";
import { Label } from "@components/ui/label";
import { MagicModalContext } from "@components/ui/magic-modal";
import { PopoverTrigger } from "@components/ui/popover";
import { useToast } from "@components/ui/toaster/use-toast";
import { useAsyncAction } from "@hooks/use-async-action";
import {
    deleteMCPConnection,
    deleteMCPCustomPlugin,
    installMCPPlugin,
    updateMCPAllowedTools,
    type getMCPPluginById,
    type getMCPPlugins,
    type getMCPPluginTools,
} from "@services/mcp-manager/fetch";
import { usePermission } from "@services/permissions/hooks";
import { Action, ResourceType } from "@services/permissions/types";
import { EditIcon, PlugIcon, RefreshCwIcon, Trash } from "lucide-react";
import type { AwaitedReturnType } from "src/core/types";
import { revalidateServerSidePath } from "src/core/utils/revalidate-server-side";
import { useSubscriptionStatus } from "src/features/ee/subscription/_hooks/use-subscription-status";

import { RequiredConfiguration } from "./required-configuration";
import { SelectTools } from "./select-tools";

export const PluginModal = ({
    plugin,
    tools,
    installedPlugins,
}: {
    plugin: AwaitedReturnType<typeof getMCPPluginById>;
    tools: AwaitedReturnType<typeof getMCPPluginTools>;
    installedPlugins: AwaitedReturnType<typeof getMCPPlugins>;
}) => {
    const router = useRouter();
    const { toast } = useToast();
    const subscription = useSubscriptionStatus();

    const mcpPluginsLimits = useMemo(() => {
        const total = installedPlugins.length;

        if (!subscription.valid)
            return {
                total,
                canAddMoreRules: false,
                limit: Number.POSITIVE_INFINITY,
            };

        if (
            subscription.status === "free" ||
            subscription.status === "self-hosted"
        )
            return { canAddMoreRules: total < 3, total, limit: 3 };

        return {
            canAddMoreRules: true,
            total,
            limit: Number.POSITIVE_INFINITY,
        };
    }, [subscription, installedPlugins]);

    const isConnected = plugin.isConnected;
    const isDefault = plugin.isDefault;
    const canEdit = usePermission(Action.Update, ResourceType.PluginSettings);
    const canDelete = usePermission(Action.Delete, ResourceType.PluginSettings);

    const [requiredParamsValues, setRequiredParamsValues] = useState<
        Record<string, string>
    >({});

    const [
        confirmInstallationOfToolsWithWarnings,
        setConfirmInstallationOfToolsWithWarnings,
    ] = useState(false);

    const [selectedTools, setSelectedTools] = useState<Array<string>>(
        isConnected
            ? plugin.allowedTools || []
            : tools.filter(({ warning }) => !warning).map(({ slug }) => slug),
    );

    // Para integrações padrão, usar todos os tools disponíveis
    const effectiveSelectedTools = selectedTools;

    const [isResettingAuth, setIsResettingAuth] = useState(false);

    const hasToolsWithWarningSelected = useMemo(
        () =>
            selectedTools.some(
                (tool) => tools.find(({ slug }) => slug === tool)?.warning,
            ),
        [selectedTools, tools],
    );

    const areRequiredParametersValid =
        Object.keys(requiredParamsValues).length ===
            (plugin.requiredParams?.length || 0) &&
        Object.values(requiredParamsValues).every((v) => v.trim().length > 0);

    const [installPlugin, { loading: isInstallPluginLoading }] = useAsyncAction(
        async () => {
            const installationResponse = await installMCPPlugin({
                id: plugin.id,
                provider: plugin.provider,
                allowedTools: selectedTools,
                authParams: requiredParamsValues,
            });

            const oAuthUrl = installationResponse.metadata.connection.authUrl;

            if (oAuthUrl?.length > 0) {
                window.location.href = oAuthUrl;
                return;
            }

            await revalidateServerSidePath("/settings/plugins");
            router.push("/settings/plugins");
        },
    );

    const [updateTools, { loading: isUpdateToolsLoading }] = useAsyncAction(
        async () => {
            await updateMCPAllowedTools({
                integrationId: plugin.id,
                allowedTools: selectedTools,
            });

            await revalidateServerSidePath("/settings/plugins");

            toast({
                variant: "success",
                title: "Tools updated successfully",
                description: `Updated ${selectedTools.length} tools for ${plugin.appName}`,
            });

            router.back();
        },
    );

    const [resetAuth, { loading: isResetAuthLoading }] = useAsyncAction(
        async () => {
            if (!plugin.connectionId) {
                throw new Error("Connection ID not found");
            }

            await deleteMCPConnection({
                connectionId: plugin.connectionId,
            });

            await revalidateServerSidePath("/settings/plugins");

            toast({
                variant: "success",
                title: "Authentication reset successfully",
                description: `${plugin.appName} plugin has been disconnected`,
            });

            setIsResettingAuth(false);
            router.back();
        },
    );

    const [deletePlugin, { loading: isDeletePluginLoading }] = useAsyncAction(
        async () => {
            if (!plugin.id) {
                throw new Error("Plugin ID not found");
            }

            if (plugin.provider !== "custom") {
                throw new Error("Only custom plugins can be deleted");
            }

            if (isConnected && plugin.connectionId) {
                await deleteMCPConnection({
                    connectionId: plugin.connectionId,
                });
            }

            await deleteMCPCustomPlugin(plugin.id);

            await revalidateServerSidePath("/settings/plugins");

            toast({
                variant: "success",
                title: "Plugin deleted successfully",
                description: `${plugin.appName} plugin has been deleted`,
            });

            router.push("/settings/plugins");
        },
    );

    const isAnyLoading =
        isInstallPluginLoading ||
        isUpdateToolsLoading ||
        isResetAuthLoading ||
        isDeletePluginLoading;

    return (
        <MagicModalContext
            value={{
                closeable: !isInstallPluginLoading && !isUpdateToolsLoading,
            }}>
            <Dialog open onOpenChange={() => router.push("/settings/plugins")}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader className="flex-row items-start justify-start gap-4">
                        <Avatar className="bg-card-lv3 size-16 rounded-lg p-1">
                            <AvatarImage src={plugin.logo} />
                        </Avatar>

                        <div className="flex min-h-16 flex-col justify-center gap-1">
                            <DialogTitle className="capitalize">
                                {plugin.appName}
                            </DialogTitle>

                            <div className="flex items-center gap-2">
                                {plugin.description && (
                                    <span className="text-text-secondary text-sm leading-tight">
                                        {plugin.description}
                                    </span>
                                )}
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="-mx-6 overflow-auto px-6">
                        <div className="flex flex-col gap-3">
                            {plugin.authScheme === "OAUTH2" && (
                                <div className="mb-2 flex items-center gap-2">
                                    <Badge className="pointer-events-none">
                                        Oauth login
                                    </Badge>

                                    {isConnected && (
                                        <Badge
                                            variant="tertiary"
                                            className="bg-success! text-card-lv2!">
                                            Installed
                                        </Badge>
                                    )}

                                    {isDefault && (
                                        <Badge
                                            variant="secondary"
                                            className="bg-primary! text-primary-foreground!">
                                            Default
                                        </Badge>
                                    )}
                                </div>
                            )}

                            {(plugin.requiredParams?.length || 0) > 0 && (
                                <RequiredConfiguration
                                    plugin={plugin}
                                    values={requiredParamsValues}
                                    setValuesAction={setRequiredParamsValues}
                                    isValid={areRequiredParametersValid}
                                />
                            )}

                            <SelectTools
                                tools={tools.length > 0 ? tools : []}
                                defaultOpen={
                                    (plugin.requiredParams?.length || 0) === 0
                                }
                                selectedTools={effectiveSelectedTools}
                                setSelectedToolsAction={(tools) => {
                                    setSelectedTools(tools);
                                    setConfirmInstallationOfToolsWithWarnings(
                                        false,
                                    );
                                }}
                            />
                        </div>
                    </div>

                    <DialogFooter className="mt-0 items-center justify-between">
                        <>
                            <div>
                                {hasToolsWithWarningSelected && (
                                    <Label className="flex items-center gap-4 select-none">
                                        <Checkbox
                                            variant="tertiary"
                                            checked={
                                                confirmInstallationOfToolsWithWarnings
                                            }
                                            onCheckedChange={(c) => {
                                                if (c === "indeterminate")
                                                    return;

                                                setConfirmInstallationOfToolsWithWarnings(
                                                    c,
                                                );
                                            }}
                                        />

                                        <span className="text-danger max-w-80 leading-tight">
                                            I understand there are dangerous
                                            tools selected and I confirm the
                                            installation of these tools
                                        </span>
                                    </Label>
                                )}
                            </div>

                            <div className="flex flex-row gap-x-2">
                                <DialogClose disabled={isAnyLoading}>
                                    <Button size="md" variant="cancel">
                                        {isConnected ? "Close" : "Go back"}
                                    </Button>
                                </DialogClose>

                                {plugin.provider === "custom" && (
                                    <Button
                                        size="md"
                                        variant="secondary"
                                        leftIcon={<EditIcon />}
                                        onClick={() =>
                                            router.push(
                                                `/settings/plugins/custom?edit=true&id=${plugin.id}`,
                                            )
                                        }
                                        disabled={isAnyLoading || !canEdit}>
                                        Edit Plugin
                                    </Button>
                                )}

                                {plugin.provider === "custom" && (
                                    <Button
                                        size="md"
                                        variant="tertiary"
                                        leftIcon={<Trash />}
                                        onClick={() => deletePlugin()}
                                        disabled={
                                            isAnyLoading ||
                                            isDefault ||
                                            !canDelete
                                        }>
                                        Delete Plugin
                                    </Button>
                                )}

                                {!isConnected ? (
                                    <>
                                        {mcpPluginsLimits.canAddMoreRules ? (
                                            <Button
                                                size="md"
                                                variant="primary"
                                                leftIcon={<PlugIcon />}
                                                loading={isInstallPluginLoading}
                                                onClick={() => installPlugin()}
                                                disabled={
                                                    !canEdit ||
                                                    isDefault ||
                                                    !areRequiredParametersValid ||
                                                    selectedTools.length ===
                                                        0 ||
                                                    (hasToolsWithWarningSelected &&
                                                        !confirmInstallationOfToolsWithWarnings)
                                                }>
                                                Install plugin
                                            </Button>
                                        ) : (
                                            <MCPPluginsLimitPopover
                                                limit={mcpPluginsLimits.limit}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        size="md"
                                                        variant="primary"
                                                        leftIcon={<PlugIcon />}
                                                        disabled={
                                                            !canEdit ||
                                                            isDefault ||
                                                            !areRequiredParametersValid ||
                                                            selectedTools.length ===
                                                                0 ||
                                                            (hasToolsWithWarningSelected &&
                                                                !confirmInstallationOfToolsWithWarnings)
                                                        }>
                                                        Install plugin
                                                    </Button>
                                                </PopoverTrigger>
                                            </MCPPluginsLimitPopover>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {isDefault ? null : (
                                            <Button
                                                size="md"
                                                variant="tertiary"
                                                leftIcon={<RefreshCwIcon />}
                                                onClick={() =>
                                                    setIsResettingAuth(true)
                                                }
                                                disabled={
                                                    !canEdit ||
                                                    isDefault ||
                                                    isResetAuthLoading
                                                }>
                                                Reset Authentication
                                            </Button>
                                        )}
                                        <Button
                                            size="md"
                                            variant="primary"
                                            leftIcon={<EditIcon />}
                                            loading={isUpdateToolsLoading}
                                            onClick={() => updateTools()}
                                            disabled={
                                                !canEdit ||
                                                selectedTools.length === 0 ||
                                                (hasToolsWithWarningSelected &&
                                                    !confirmInstallationOfToolsWithWarnings)
                                            }>
                                            Update Tools
                                        </Button>
                                    </>
                                )}
                            </div>
                        </>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmModal
                open={isResettingAuth}
                title="Reset Plugin Authentication"
                description="This will disconnect the plugin and remove all authentication data. You'll need to reinstall and reconfigure the plugin."
                confirmText="Reset Authentication"
                variant="tertiary"
                loading={isResetAuthLoading}
                onConfirm={() => resetAuth()}
                onCancel={() => setIsResettingAuth(false)}
            />
        </MagicModalContext>
    );
};

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarImage } from "@components/ui/avatar";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
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
import { useAsyncAction } from "@hooks/use-async-action";
import {
    deleteMCPConnection,
    installMCPPlugin,
    updateMCPAllowedTools,
    type getMCPPluginById,
    type getMCPPluginTools,
} from "@services/mcp-manager/fetch";
import { EditIcon, PlugIcon, RefreshCwIcon } from "lucide-react";
import type { AwaitedReturnType } from "src/core/types";
import { revalidateServerSidePath } from "src/core/utils/revalidate-server-side";

import { RequiredConfiguration } from "./required-configuration";
import { SelectTools } from "./select-tools";

export const PluginModal = ({
    plugin,
    tools,
}: {
    plugin: AwaitedReturnType<typeof getMCPPluginById>;
    tools: AwaitedReturnType<typeof getMCPPluginTools>;
}) => {
    const router = useRouter();

    const isConnected = plugin.isConnected;

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

    // Debug: log para verificar os dados
    console.log("Plugin data in modal:", {
        isConnected,
        allowedTools: plugin.allowedTools,
        allowedToolsLength: plugin.allowedTools?.length,
        toolsCount: tools.length,
        selectedTools,
        plugin: plugin,
    });
    console.log("Full plugin object:", JSON.stringify(plugin, null, 2));

    const [isEditingTools, setIsEditingTools] = useState(false);
    const [isResettingAuth, setIsResettingAuth] = useState(false);

    // Reset selectedTools quando entrar no modo de edição
    useEffect(() => {
        if (isEditingTools && isConnected) {
            setSelectedTools(plugin.allowedTools || []);
        }
    }, [isEditingTools, isConnected, plugin.allowedTools]);

    const hasToolsWithWarningSelected = useMemo(
        () =>
            selectedTools.some(
                (tool) => tools.find(({ slug }) => slug === tool)?.warning,
            ),
        [selectedTools, tools],
    );

    const areRequiredParametersValid =
        Object.keys(requiredParamsValues).length ===
            plugin.requiredParams.length &&
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

            if (oAuthUrl.length > 0) {
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

            setIsEditingTools(false);
            await revalidateServerSidePath("/settings/plugins");
        },
    );

    const [resetAuth, { loading: isResetAuthLoading }] = useAsyncAction(
        async () => {
            await deleteMCPConnection({
                integrationId: plugin.id,
            });

            setIsResettingAuth(false);
            await revalidateServerSidePath("/settings/plugins");
            router.push("/settings/plugins");
        },
    );

    const isAnyLoading =
        isInstallPluginLoading || isUpdateToolsLoading || isResetAuthLoading;

    return (
        <MagicModalContext value={{ closeable: !isAnyLoading }}>
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
                                </div>
                            )}

                            {plugin.requiredParams.length > 0 && (
                                <RequiredConfiguration
                                    plugin={plugin}
                                    values={requiredParamsValues}
                                    setValues={setRequiredParamsValues}
                                    isValid={areRequiredParametersValid}
                                />
                            )}

                            {isConnected && !isEditingTools ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold">
                                            Tools Configuration
                                        </h3>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                leftIcon={<EditIcon />}
                                                onClick={() =>
                                                    setIsEditingTools(true)
                                                }>
                                                Edit Tools
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="tertiary"
                                                leftIcon={<RefreshCwIcon />}
                                                onClick={() =>
                                                    setIsResettingAuth(true)
                                                }
                                                disabled={isResetAuthLoading}>
                                                Reset Authentication
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="font-medium">
                                            Currently Allowed Tools:
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {plugin.allowedTools?.length > 0 ? (
                                                plugin.allowedTools.map(
                                                    (toolSlug) => {
                                                        const tool = tools.find(
                                                            (t) =>
                                                                t.slug ===
                                                                toolSlug,
                                                        );
                                                        return (
                                                            <Badge
                                                                key={toolSlug}
                                                                variant="secondary"
                                                                className={
                                                                    tool?.warning
                                                                        ? "bg-warning text-card-lv2"
                                                                        : ""
                                                                }>
                                                                {tool?.name ||
                                                                    toolSlug}
                                                            </Badge>
                                                        );
                                                    },
                                                )
                                            ) : (
                                                <span className="text-text-secondary text-sm">
                                                    No tools currently allowed -
                                                    click "Edit Tools" to
                                                    configure
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <SelectTools
                                    tools={tools.length > 0 ? tools : []}
                                    defaultOpen={
                                        !isConnected ||
                                        isEditingTools ||
                                        plugin.requiredParams.length === 0
                                    }
                                    selectedTools={selectedTools}
                                    setSelectedTools={(tools) => {
                                        setSelectedTools(tools);
                                        setConfirmInstallationOfToolsWithWarnings(
                                            false,
                                        );
                                    }}
                                />
                            )}

                            {isEditingTools && (
                                <div className="flex justify-end gap-2">
                                    <Button
                                        size="sm"
                                        variant="cancel"
                                        onClick={() => {
                                            setIsEditingTools(false);
                                            setSelectedTools(
                                                plugin.allowedTools || [],
                                            );
                                        }}
                                        disabled={isUpdateToolsLoading}>
                                        Cancel
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="primary"
                                        onClick={() => updateTools()}
                                        loading={isUpdateToolsLoading}
                                        disabled={
                                            selectedTools.length === 0 ||
                                            (hasToolsWithWarningSelected &&
                                                !confirmInstallationOfToolsWithWarnings)
                                        }>
                                        Update Tools
                                    </Button>
                                </div>
                            )}
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
                                <DialogClose disabled={isInstallPluginLoading}>
                                    <Button size="md" variant="cancel">
                                        Go back
                                    </Button>
                                </DialogClose>

                                {!isConnected && (
                                    <Button
                                        size="md"
                                        variant="primary"
                                        leftIcon={<PlugIcon />}
                                        loading={isInstallPluginLoading}
                                        onClick={() => installPlugin()}
                                        disabled={
                                            !areRequiredParametersValid ||
                                            selectedTools.length === 0 ||
                                            (hasToolsWithWarningSelected &&
                                                !confirmInstallationOfToolsWithWarnings)
                                        }>
                                        Install plugin
                                    </Button>
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

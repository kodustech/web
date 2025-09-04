"use client";

import { useMemo, useState } from "react";
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
import { useToast } from "@components/ui/toaster/use-toast";
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
    const { toast } = useToast();

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

    const isAnyLoading =
        isInstallPluginLoading || isUpdateToolsLoading || isResetAuthLoading;

    return (
        <MagicModalContext value={{ closeable: !isInstallPluginLoading && !isUpdateToolsLoading }}>
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

                            <SelectTools
                                tools={tools.length > 0 ? tools : []}
                                defaultOpen={plugin.requiredParams.length === 0}
                                selectedTools={selectedTools}
                                setSelectedTools={(tools) => {
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

                                {!isConnected ? (
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
                                ) : (
                                    <>
                                        <Button
                                            size="md"
                                            variant="tertiary"
                                            leftIcon={<RefreshCwIcon />}
                                            onClick={() => setIsResettingAuth(true)}
                                            disabled={isResetAuthLoading}>
                                            Reset Authentication
                                        </Button>
                                        <Button
                                            size="md"
                                            variant="primary"
                                            leftIcon={<EditIcon />}
                                            loading={isUpdateToolsLoading}
                                            onClick={() => updateTools()}
                                            disabled={
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

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarImage } from "@components/ui/avatar";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@components/ui/dialog";
import { MagicModalContext } from "@components/ui/magic-modal";
import { useAsyncAction } from "@hooks/use-async-action";
import {
    installMCPPlugin,
    type getMCPPluginById,
    type getMCPPluginTools,
} from "@services/mcp-manager/fetch";
import { PlugIcon } from "lucide-react";
import { revalidateServerSidePath } from "src/core/utils/revalidate-server-side";

import { RequiredConfiguration } from "./required-configuration";
import { SelectTools } from "./select-tools";

export const PluginModal = ({
    plugin,
    tools,
}: {
    plugin: Awaited<ReturnType<typeof getMCPPluginById>>;
    tools: Awaited<ReturnType<typeof getMCPPluginTools>>;
}) => {
    const router = useRouter();

    const [requiredParamsValues, setRequiredParamsValues] = useState<
        Record<string, string>
    >({});

    const [selectedTools, setSelectedTools] = useState<Array<string>>(
        tools.map(({ slug }) => slug),
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

    return (
        <MagicModalContext value={{ closeable: !isInstallPluginLoading }}>
            <Dialog open onOpenChange={() => router.push("/settings/plugins")}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader className="flex-row items-start justify-start gap-4">
                        <Avatar className="bg-card-lv3 size-16 rounded-lg p-1">
                            <AvatarImage src={plugin.logo} />
                        </Avatar>

                        <div className="flex min-h-16 flex-col justify-center gap-1">
                            <DialogTitle className="capitalize">
                                {plugin.appName}
                            </DialogTitle>

                            {plugin.description && (
                                <span className="text-text-secondary text-sm leading-tight">
                                    {plugin.description}
                                </span>
                            )}
                        </div>
                    </DialogHeader>

                    <div className="-mx-6 max-h-130 overflow-auto px-6">
                        <div className="flex flex-col gap-3">
                            {plugin.authScheme === "OAUTH2" && (
                                <div className="mb-2 flex items-center gap-2">
                                    <Badge className="pointer-events-none">
                                        Oauth login
                                    </Badge>

                                    <span className="text-sm">
                                        Click in <strong>install plugin</strong>{" "}
                                        button below to initiate login process
                                    </span>
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
                                tools={tools}
                                defaultOpen={plugin.requiredParams.length === 0}
                                selectedTools={selectedTools}
                                setSelectedTools={setSelectedTools}
                            />
                        </div>
                    </div>

                    <DialogFooter className="mt-0">
                        <DialogClose disabled={isInstallPluginLoading}>
                            <Button size="md" variant="cancel">
                                Go back
                            </Button>
                        </DialogClose>

                        <Button
                            size="md"
                            variant="primary"
                            leftIcon={<PlugIcon />}
                            loading={isInstallPluginLoading}
                            onClick={() => installPlugin()}
                            disabled={
                                !areRequiredParametersValid ||
                                selectedTools.length === 0
                            }>
                            Install plugin
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </MagicModalContext>
    );
};

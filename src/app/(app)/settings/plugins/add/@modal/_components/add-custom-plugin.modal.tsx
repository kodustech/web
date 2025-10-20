"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@components/ui/dialog";
import { FormControl } from "@components/ui/form-control";
import { Input } from "@components/ui/input";
import { MagicModalContext } from "@components/ui/magic-modal";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@components/ui/select";
import { useToast } from "@components/ui/toaster/use-toast";
import { useAsyncAction } from "@hooks/use-async-action";
import { usePermission } from "@services/permissions/hooks";
import { Action, ResourceType } from "@services/permissions/types";
import { revalidateServerSidePath } from "src/core/utils/revalidate-server-side";

export const AddCustomPluginModal = () => {
    const router = useRouter();
    const { toast } = useToast();
    const canCreate = usePermission(Action.Create, ResourceType.PluginSettings);

    const [name, setName] = useState("");
    const [url, setUrl] = useState("");
    const [customHeaders, setCustomHeaders] = useState("");

    const [createPlugin, { loading: isCreatePluginLoading }] = useAsyncAction(
        async () => {
            // await createMCPPlugin({
            //     name,
            //     url,
            //     authMethod,
            // });

            await revalidateServerSidePath("/settings/plugins");

            toast({
                variant: "success",
                title: "Custom plugin created successfully",
                description: `The plugin "${name}" has been created.`,
            });

            router.back();
        },
    );

    return (
        <MagicModalContext
            value={{
                closeable: !isCreatePluginLoading,
            }}>
            <Dialog open onOpenChange={() => router.push("/settings/plugins")}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Add Custom Plugin</DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col gap-4 py-4">
                        <FormControl.Root>
                            <FormControl.Label>Plugin Name</FormControl.Label>
                            <FormControl.Input>
                                <Input
                                    size="md"
                                    placeholder="My Custom Plugin"
                                    value={name}
                                    disabled={!canCreate}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </FormControl.Input>
                        </FormControl.Root>

                        <FormControl.Root>
                            <FormControl.Label>URL</FormControl.Label>
                            <FormControl.Input>
                                <Input
                                    size="md"
                                    placeholder="https://example.com/mcp"
                                    value={url}
                                    disabled={!canCreate}
                                    onChange={(e) => setUrl(e.target.value)}
                                />
                            </FormControl.Input>
                        </FormControl.Root>

                        <FormControl.Root>
                            <FormControl.Label>
                                Custom Headers (Optional)
                            </FormControl.Label>
                            <FormControl.Input>
                                <Input
                                    size="lg"
                                    placeholder="
                                    {
                                        authorization: Bearer my_api_key,
                                        'x-custom-header': custom_value
                                    }
                                    "
                                    value={customHeaders}
                                    disabled={!canCreate}
                                    onChange={(e) =>
                                        setCustomHeaders(e.target.value)
                                    }
                                />
                            </FormControl.Input>
                        </FormControl.Root>
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button
                                size="md"
                                variant="cancel"
                                disabled={isCreatePluginLoading}>
                                Go back
                            </Button>
                        </DialogClose>
                        <Button
                            size="md"
                            variant="primary"
                            loading={isCreatePluginLoading}
                            disabled={
                                !canCreate ||
                                !name ||
                                !url ||
                                isCreatePluginLoading
                            }
                            onClick={() => createPlugin()}>
                            Add Plugin
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </MagicModalContext>
    );
};

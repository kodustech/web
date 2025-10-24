"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarImage } from "@components/ui/avatar";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useAsyncAction } from "@hooks/use-async-action";
import { Description } from "@radix-ui/themes/dist/cjs/components/alert-dialog";
import {
    createMCPCustomPlugin,
    getMCPPluginById,
    updateMCPCustomPlugin,
} from "@services/mcp-manager/fetch";
import { usePermission } from "@services/permissions/hooks";
import { Action, ResourceType } from "@services/permissions/types";
import { ImageOff, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { AwaitedReturnType } from "src/core/types";
import { revalidateServerSidePath } from "src/core/utils/revalidate-server-side";
import z from "zod";

const AUTH_METHODS = {
    NONE: "none",
    BEARER: "bearer_token",
    BASIC: "basic",
    API_KEY: "api_key",
} as const;

type AuthMethodType = (typeof AUTH_METHODS)[keyof typeof AUTH_METHODS];

const PROTOCOLS = {
    HTTP: "http",
    STDIO: "stdio",
    SSE: "sse",
    WEBSOCKET: "websocket",
} as const;

type ProtocolType = (typeof PROTOCOLS)[keyof typeof PROTOCOLS];

const baseSchema = z.object({
    name: z.string().trim().min(1, "Plugin Name is required"),
    description: z.string().optional(),
    baseUrl: z.url().trim().min(1, "URL is required"),
    protocol: z.enum(PROTOCOLS),
    logoUrl: z.string().optional(),
    headers: z.array(
        z.object({
            key: z.string(),
            value: z.string(),
        }),
    ),
});

const authSchema = z.discriminatedUnion("authMethod", [
    z.object({ authMethod: z.literal(AUTH_METHODS.NONE) }),
    z.object({
        authMethod: z.literal(AUTH_METHODS.BEARER),
        bearerToken: z.string().trim().min(1, "Bearer Token is required"),
    }),
    z.object({
        authMethod: z.literal(AUTH_METHODS.BASIC),
        basicUser: z.string().trim().min(1, "Username is required"),
        basicPassword: z.string().optional(),
    }),
    z.object({
        authMethod: z.literal(AUTH_METHODS.API_KEY),
        apiKey: z.string().trim().min(1, "API Key is required"),
        apiKeyHeader: z.string().trim().min(1, "Header Name is required"),
    }),
]);

const addCustomPluginSchema = z
    .intersection(baseSchema, authSchema)
    .superRefine((data, ctx) => {
        const existingKeys = new Set<string>();
        let hasDuplicates = false;

        data.headers.forEach((header, index) => {
            const key = header.key.trim().toLowerCase();
            if (!key) return;

            if (existingKeys.has(key)) {
                hasDuplicates = true;
                ctx.addIssue({
                    code: "custom",
                    message: "Key must be unique",
                    path: [`headers.${index}.key`],
                });
            }
            existingKeys.add(key);
        });

        if (hasDuplicates) {
            ctx.addIssue({
                code: "custom",
                message: "Header keys must be unique.",
                path: ["headers"],
            });
        }
    });

type AddCustomPluginFormValues = z.infer<typeof addCustomPluginSchema>;

const getEmptyDefaultValues = (): AddCustomPluginFormValues => ({
    name: "",
    description: "",
    baseUrl: "",
    protocol: PROTOCOLS.HTTP,
    logoUrl: "",
    authMethod: AUTH_METHODS.NONE,
    headers: [{ key: "", value: "" }],
    // @ts-expect-error Default values for discriminated union
    bearerToken: "",
    basicUser: "",
    basicPassword: "",
    apiKey: "",
    apiKeyHeader: "",
});

const convertApiDataToFormData = (
    data: AwaitedReturnType<typeof getMCPPluginById>,
): AddCustomPluginFormValues => {
    const formData: AddCustomPluginFormValues = {
        name: data.name || "",
        description: data.description || "",
        baseUrl: data.baseUrl || "",
        protocol: (data.protocol as ProtocolType) || PROTOCOLS.HTTP,
        logoUrl: data.logo || "",
        authMethod: (data.authType as AuthMethodType) || AUTH_METHODS.NONE,
        headers: [],
        bearerToken: "",
        basicUser: "",
        basicPassword: "",
        apiKey: "",
        apiKeyHeader: "",
    };

    if (data.headers && Object.entries(data.headers).length > 0) {
        for (const [key, value] of Object.entries(data.headers)) {
            formData.headers.push({ key, value });
        }
    }

    switch (formData.authMethod) {
        case AUTH_METHODS.BEARER:
            formData.bearerToken = "";
            break;
        case AUTH_METHODS.BASIC:
            formData.basicUser = data.basicUser || "";
            formData.basicPassword = "";
            break;
        case AUTH_METHODS.API_KEY:
            formData.apiKey = "";
            formData.apiKeyHeader = data.apiKeyHeader || "";
            break;
        case AUTH_METHODS.NONE:
        default:
            break;
    }

    return formData;
};

const convertFormDataToApiPayload = (
    formData: AddCustomPluginFormValues,
): Parameters<typeof createMCPCustomPlugin>[0] => {
    const payload: Parameters<typeof createMCPCustomPlugin>[0] = {
        name: formData.name,
        description: formData.description || undefined,
        baseUrl: formData.baseUrl,
        authType: formData.authMethod,
        protocol: formData.protocol,
        logoUrl: formData.logoUrl || undefined,
    };

    const filteredHeaders = formData.headers.filter(
        (header) => header.key.trim() !== "",
    );
    if (filteredHeaders.length > 0) {
        payload.headers = filteredHeaders;
    }

    switch (formData.authMethod) {
        case AUTH_METHODS.BEARER:
            payload.bearerToken = formData.bearerToken;
            break;
        case AUTH_METHODS.BASIC:
            payload.basicUser = formData.basicUser;
            payload.basicPassword = formData.basicPassword;
            break;
        case AUTH_METHODS.API_KEY:
            payload.apiKey = formData.apiKey;
            payload.apiKeyHeader = formData.apiKeyHeader;
            break;
        case AUTH_METHODS.NONE:
        default:
            break;
    }

    return payload;
};

export const AddCustomPluginModal = ({
    pluginToEdit,
}: {
    pluginToEdit?: AwaitedReturnType<typeof getMCPPluginById>;
}) => {
    const router = useRouter();
    const { toast } = useToast();
    const canCreate = usePermission(Action.Create, ResourceType.PluginSettings);
    const canEdit = usePermission(Action.Update, ResourceType.PluginSettings);

    const isEditMode = !!pluginToEdit;
    const canPerformAction = isEditMode ? canEdit : canCreate;

    const form = useForm<
        AddCustomPluginFormValues,
        any,
        AddCustomPluginFormValues
    >({
        resolver: zodResolver(addCustomPluginSchema),
        defaultValues: isEditMode
            ? convertApiDataToFormData(pluginToEdit!)
            : getEmptyDefaultValues(),
        mode: "all",
        reValidateMode: "onChange",
        criteriaMode: "firstError",
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "headers",
    });

    const [createPluginAction, { loading: isCreatePluginLoading }] =
        useAsyncAction(async (data: AddCustomPluginFormValues) => {
            try {
                const payload = convertFormDataToApiPayload(data);

                const plugin = await createMCPCustomPlugin(payload);

                await revalidateServerSidePath("/settings/plugins");

                toast({
                    variant: "success",
                    title: "Custom plugin created successfully",
                    description: `The plugin "${data.name}" has been created.`,
                });

                router.push(`/settings/plugins/custom/${plugin.id}`);
            } catch (error) {
                console.warn("Error creating custom plugin:", error);

                toast({
                    variant: "danger",
                    title: "Error creating custom plugin",
                    description:
                        "Are the protocol, URL, and authorization details correct? Please check and try again.",
                });
            }
        });

    const [updatePluginAction, { loading: isUpdatePluginLoading }] =
        useAsyncAction(async (data: AddCustomPluginFormValues) => {
            try {
                if (!pluginToEdit) return;

                const payload = convertFormDataToApiPayload(data);

                await updateMCPCustomPlugin(pluginToEdit.id, payload);

                await revalidateServerSidePath("/settings/plugins");

                toast({
                    variant: "success",
                    title: "Custom plugin updated",
                    description: `The plugin "${data.name}" has been updated.`,
                });

                router.push(`/settings/plugins/custom/${pluginToEdit.id}`);
            } catch (error) {
                console.warn("Error updating custom plugin:", error);

                toast({
                    variant: "danger",
                    title: "Error updating custom plugin",
                    description:
                        "Are the protocol, URL, and authorization details correct? Please check and try again.",
                });
            }
        });

    const handleSubmit = form.handleSubmit((data) => {
        if (isEditMode) {
            updatePluginAction(data);
        } else {
            createPluginAction(data);
        }
    });

    const isLoading = isCreatePluginLoading || isUpdatePluginLoading;

    const watchedAuthMethod = form.watch("authMethod");
    const watchedApiKeyHeader = form.watch("apiKeyHeader");
    const watchedHeaders = form.watch("headers");

    const manuallyOverriddenHeader = useMemo(() => {
        const authManagedHeaders = new Set<string>();

        if (
            watchedAuthMethod === AUTH_METHODS.BEARER ||
            watchedAuthMethod === AUTH_METHODS.BASIC
        ) {
            authManagedHeaders.add("authorization");
        } else if (
            watchedAuthMethod === AUTH_METHODS.API_KEY &&
            watchedApiKeyHeader?.trim()
        ) {
            authManagedHeaders.add(watchedApiKeyHeader.trim().toLowerCase());
        }

        return watchedHeaders.find((h) =>
            authManagedHeaders.has(h.key.trim().toLowerCase()),
        );
    }, [watchedAuthMethod, watchedApiKeyHeader, watchedHeaders]);

    return (
        <MagicModalContext
            value={{
                closeable: !isLoading,
            }}>
            <Dialog open onOpenChange={() => router.push("/settings/plugins")}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {isEditMode
                                ? "Edit Custom Plugin"
                                : "Add Custom Plugin"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col gap-4 py-4">
                        <Controller
                            name="name"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <FormControl.Root>
                                    <FormControl.Label>
                                        Plugin Name
                                    </FormControl.Label>
                                    <FormControl.Input>
                                        <Input
                                            size="md"
                                            placeholder="My Custom Plugin"
                                            disabled={!canPerformAction}
                                            {...field}
                                        />
                                    </FormControl.Input>
                                    {fieldState.error && (
                                        <FormControl.Error>
                                            {fieldState.error.message}
                                        </FormControl.Error>
                                    )}
                                </FormControl.Root>
                            )}
                        />

                        <Controller
                            name="description"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <FormControl.Root>
                                    <FormControl.Label>
                                        Description (Optional)
                                    </FormControl.Label>
                                    <FormControl.Input>
                                        <Input
                                            size="md"
                                            placeholder="A brief description of the plugin"
                                            disabled={!canPerformAction}
                                            {...field}
                                        />
                                    </FormControl.Input>
                                    {fieldState.error && (
                                        <FormControl.Error>
                                            {fieldState.error.message}
                                        </FormControl.Error>
                                    )}
                                </FormControl.Root>
                            )}
                        />

                        <Controller
                            name="logoUrl"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <FormControl.Root>
                                    <FormControl.Label>
                                        Logo URL (Optional)
                                    </FormControl.Label>
                                    <FormControl.Input>
                                        <div className="flex items-center gap-4">
                                            <Input
                                                size="md"
                                                placeholder="https://example.com/logo.png"
                                                disabled={!canPerformAction}
                                                {...field}
                                            />
                                            <Avatar className="bg-card-lv3 group-disabled/link:bg-card-lv3/50 size-10 rounded-lg p-1">
                                                {(field.value && (
                                                    <AvatarImage
                                                        src={field.value}
                                                        className="object-contain"
                                                    />
                                                )) || (
                                                    <ImageOff className="text-text-tertiary m-auto h-6 w-6" />
                                                )}
                                            </Avatar>
                                        </div>
                                    </FormControl.Input>
                                    {fieldState.error && (
                                        <FormControl.Error>
                                            {fieldState.error.message}
                                        </FormControl.Error>
                                    )}
                                </FormControl.Root>
                            )}
                        />

                        <Controller
                            name="baseUrl"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <FormControl.Root>
                                    <FormControl.Label>URL</FormControl.Label>
                                    <FormControl.Input>
                                        <Input
                                            size="md"
                                            placeholder="https://example.com/mcp"
                                            disabled={!canPerformAction}
                                            {...field}
                                        />
                                    </FormControl.Input>
                                    {fieldState.error && (
                                        <FormControl.Error>
                                            {fieldState.error.message}
                                        </FormControl.Error>
                                    )}
                                </FormControl.Root>
                            )}
                        />

                        <Controller
                            name="protocol"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <FormControl.Root>
                                    <FormControl.Label>
                                        Protocol
                                    </FormControl.Label>

                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        disabled={!canPerformAction}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a protocol" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={PROTOCOLS.HTTP}>
                                                HTTP
                                            </SelectItem>
                                            <SelectItem value={PROTOCOLS.STDIO}>
                                                STDIO
                                            </SelectItem>
                                            <SelectItem value={PROTOCOLS.SSE}>
                                                SSE
                                            </SelectItem>
                                            <SelectItem
                                                value={PROTOCOLS.WEBSOCKET}>
                                                WebSocket
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {fieldState.error && (
                                        <FormControl.Error>
                                            {fieldState.error.message}
                                        </FormControl.Error>
                                    )}
                                </FormControl.Root>
                            )}
                        />

                        <Controller
                            name="authMethod"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <FormControl.Root>
                                    <FormControl.Label>
                                        Authorization (Optional)
                                    </FormControl.Label>
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        disabled={!canPerformAction}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a method" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem
                                                value={AUTH_METHODS.NONE}>
                                                None
                                            </SelectItem>
                                            <SelectItem
                                                value={AUTH_METHODS.BEARER}>
                                                Bearer Token
                                            </SelectItem>
                                            <SelectItem
                                                value={AUTH_METHODS.BASIC}>
                                                Basic Auth
                                            </SelectItem>
                                            <SelectItem
                                                value={AUTH_METHODS.API_KEY}>
                                                API Key
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {fieldState.error && (
                                        <FormControl.Error>
                                            {fieldState.error.message}
                                        </FormControl.Error>
                                    )}
                                </FormControl.Root>
                            )}
                        />

                        {watchedAuthMethod === AUTH_METHODS.BEARER && (
                            <Controller
                                name="bearerToken"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <FormControl.Root>
                                        <FormControl.Label>
                                            Bearer Token
                                        </FormControl.Label>
                                        <FormControl.Input>
                                            <Input
                                                size="md"
                                                type="password"
                                                placeholder="Enter your token"
                                                disabled={!canPerformAction}
                                                {...field}
                                            />
                                        </FormControl.Input>
                                        {fieldState.error && (
                                            <FormControl.Error>
                                                {fieldState.error.message}
                                            </FormControl.Error>
                                        )}
                                    </FormControl.Root>
                                )}
                            />
                        )}

                        {watchedAuthMethod === AUTH_METHODS.BASIC && (
                            <div className="grid grid-cols-2 gap-2">
                                <Controller
                                    name="basicUser"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <FormControl.Root>
                                            <FormControl.Label>
                                                Username
                                            </FormControl.Label>
                                            <FormControl.Input>
                                                <Input
                                                    size="md"
                                                    placeholder="Username"
                                                    disabled={!canPerformAction}
                                                    {...field}
                                                />
                                            </FormControl.Input>
                                            {fieldState.error && (
                                                <FormControl.Error>
                                                    {fieldState.error.message}
                                                </FormControl.Error>
                                            )}
                                        </FormControl.Root>
                                    )}
                                />
                                <Controller
                                    name="basicPassword"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <FormControl.Root>
                                            <FormControl.Label>
                                                Password
                                            </FormControl.Label>
                                            <FormControl.Input>
                                                <Input
                                                    size="md"
                                                    type="password"
                                                    placeholder="Password"
                                                    disabled={!canPerformAction}
                                                    {...field}
                                                />
                                            </FormControl.Input>
                                            {fieldState.error && (
                                                <FormControl.Error>
                                                    {fieldState.error.message}
                                                </FormControl.Error>
                                            )}
                                        </FormControl.Root>
                                    )}
                                />
                            </div>
                        )}

                        {watchedAuthMethod === AUTH_METHODS.API_KEY && (
                            <div className="grid grid-cols-2 gap-2">
                                <Controller
                                    name="apiKeyHeader"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <FormControl.Root>
                                            <FormControl.Label>
                                                Header Name
                                            </FormControl.Label>
                                            <FormControl.Input>
                                                <Input
                                                    size="md"
                                                    placeholder="e.g., X-API-Key"
                                                    disabled={!canPerformAction}
                                                    {...field}
                                                />
                                            </FormControl.Input>
                                            {fieldState.error && (
                                                <FormControl.Error>
                                                    {fieldState.error.message}
                                                </FormControl.Error>
                                            )}
                                        </FormControl.Root>
                                    )}
                                />
                                <Controller
                                    name="apiKey"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <FormControl.Root>
                                            <FormControl.Label>
                                                API Key
                                            </FormControl.Label>
                                            <FormControl.Input>
                                                <Input
                                                    size="md"
                                                    type="password"
                                                    placeholder="Your API Key"
                                                    disabled={!canPerformAction}
                                                    {...field}
                                                />
                                            </FormControl.Input>
                                            {fieldState.error && (
                                                <FormControl.Error>
                                                    {fieldState.error.message}
                                                </FormControl.Error>
                                            )}
                                        </FormControl.Root>
                                    )}
                                />
                            </div>
                        )}

                        <hr className="my-2" />

                        <FormControl.Root>
                            <FormControl.Label>
                                Custom Headers (Optional)
                            </FormControl.Label>
                            <div className="flex flex-col gap-2">
                                {fields.map((field, index) => (
                                    <div
                                        key={field.id}
                                        className="flex items-start gap-2">
                                        <Controller
                                            name={`headers.${index}.key`}
                                            control={form.control}
                                            render={({
                                                field: inputField,
                                                fieldState,
                                            }) => (
                                                <div className="flex-1">
                                                    <Input
                                                        size="md"
                                                        placeholder="Header Key"
                                                        disabled={
                                                            !canPerformAction
                                                        }
                                                        {...inputField}
                                                    />
                                                    {fieldState.error && (
                                                        <FormControl.Error>
                                                            {
                                                                fieldState.error
                                                                    .message
                                                            }
                                                        </FormControl.Error>
                                                    )}
                                                </div>
                                            )}
                                        />

                                        <Controller
                                            name={`headers.${index}.value`}
                                            control={form.control}
                                            render={({
                                                field: inputField,
                                                fieldState,
                                            }) => (
                                                <div className="flex-1">
                                                    <Input
                                                        size="md"
                                                        placeholder="Header Value"
                                                        disabled={
                                                            !canPerformAction
                                                        }
                                                        {...inputField}
                                                    />
                                                    {fieldState.error && (
                                                        <FormControl.Error>
                                                            {
                                                                fieldState.error
                                                                    .message
                                                            }
                                                        </FormControl.Error>
                                                    )}
                                                </div>
                                            )}
                                        />

                                        {fields.length > 1 && (
                                            <Button
                                                variant="error"
                                                size="icon-sm"
                                                className="text-muted-foreground hover:text-destructive shrink-0"
                                                disabled={!canPerformAction}
                                                onClick={() => remove(index)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <Button
                                type="button"
                                variant="helper"
                                size="sm"
                                className="mt-2 w-full"
                                disabled={!canPerformAction}
                                onClick={() => append({ key: "", value: "" })}>
                                Add Header
                            </Button>

                            {form.formState.errors.headers?.root && (
                                <FormControl.Error>
                                    {form.formState.errors.headers.root.message}
                                </FormControl.Error>
                            )}

                            {manuallyOverriddenHeader && (
                                <FormControl.Error>
                                    The "{manuallyOverriddenHeader.key}" header
                                    will be overridden by your Authorization
                                    selection.
                                </FormControl.Error>
                            )}
                        </FormControl.Root>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button
                                size="md"
                                variant="cancel"
                                disabled={isLoading}>
                                Go back
                            </Button>
                        </DialogClose>
                        <Button
                            size="md"
                            variant="primary"
                            loading={isLoading}
                            disabled={
                                !canPerformAction ||
                                !form.formState.isValid ||
                                isLoading
                            }
                            onClick={handleSubmit}>
                            {isEditMode ? "Update Plugin" : "Create Plugin"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </MagicModalContext>
    );
};

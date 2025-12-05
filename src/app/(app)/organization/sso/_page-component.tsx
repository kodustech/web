"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@components/ui/button";
import { Card, CardHeader } from "@components/ui/card";
import { FormControl } from "@components/ui/form-control";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Page } from "@components/ui/page";
import { Switch } from "@components/ui/switch";
import { Textarea } from "@components/ui/textarea";
import { toast } from "@components/ui/toaster/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAsyncAction } from "@hooks/use-async-action";
import { createOrUpdateSSOConfig } from "@services/ssoConfig/fetch";
import { Save, Upload } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { publicDomainsSet } from "src/core/utils/email";
import { revalidateServerSidePath } from "src/core/utils/revalidate-server-side";
import { SSOConfig, SSOProtocol } from "src/lib/auth/types";
import { z } from "zod";

import {
    fetchAndParseMetadata,
    parseMetadataFromFile,
} from "./_components/metadata";

const createSsoSchema = (userDomain: string) =>
    z
        .object({
            active: z.boolean().optional(),
            providerConfig: z.object({
                issuer: z.string().optional(),
                idpIssuer: z.string().min(1, "Issuer is required"),
                entryPoint: z.url("Must be a valid URL"),
                cert: z.string().min(1, "Certificate is required"),
                identifierFormat: z.string().optional(),
            }),
            domains: z.array(z.string()),
        })
        .superRefine((data, ctx) => {
            if (data.active) {
                const { domains } = data;
                const validDomains = domains.filter((d) => d);

                if (validDomains.length === 0) {
                    ctx.addIssue({
                        code: "custom",
                        message:
                            "At least one domain is required when SSO is enabled.",
                        path: ["domains"],
                    });
                    return;
                }

                const lowercaseDomains = validDomains.map((d) =>
                    d.toLowerCase(),
                );
                const isPublicDomain = lowercaseDomains.some((d) =>
                    publicDomainsSet.has(d),
                );

                if (isPublicDomain) {
                    ctx.addIssue({
                        code: "custom",
                        message: "Public domains are not allowed.",
                        path: ["domains"],
                    });
                }

                if (validDomains.some((domain) => domain !== userDomain)) {
                    ctx.addIssue({
                        code: "custom",
                        message: "You can only add your own domain.",
                        path: ["domains"],
                    });
                }
            }
        });

type SsoFormData = z.infer<ReturnType<typeof createSsoSchema>>;

export const ClientSsoOrganizationSettingsPage = (props: {
    email: string;
    ssoConfig: SSOConfig<SSOProtocol.SAML>;
    uuid?: string;
}) => {
    const router = useRouter();
    const [metadataUrl, setMetadataUrl] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const userDomain = props.email.split("@")[1];
    const form = useForm<SsoFormData>({
        mode: "onChange",
        resolver: zodResolver(createSsoSchema(userDomain)),
        defaultValues: {
            active: props.ssoConfig.active,
            providerConfig: {
                idpIssuer: props.ssoConfig.providerConfig?.idpIssuer || "",
                entryPoint: props.ssoConfig.providerConfig?.entryPoint || "",
                cert: props.ssoConfig.providerConfig?.cert || "",
                identifierFormat:
                    props.ssoConfig.providerConfig?.identifierFormat ||
                    "urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress",
                issuer:
                    props.ssoConfig.providerConfig.issuer ||
                    "kodus-orchestrator",
            },
            domains:
                props.ssoConfig.domains.length > 0
                    ? props.ssoConfig.domains
                    : [userDomain],
        },
    });

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isDirty, isValid },
    } = form;

    // Set the identifier format to the required SAML format
    useEffect(() => {
        setValue(
            "providerConfig.identifierFormat",
            "urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress",
        );
    }, [setValue]);

    const [saveSettings, { loading: isLoadingSubmitButton }] = useAsyncAction(
        async (data: SsoFormData) => {
            try {
                await createOrUpdateSSOConfig({
                    protocol: SSOProtocol.SAML,
                    providerConfig: data.providerConfig,
                    active: data.active,
                    uuid: props.uuid,
                    domains: data.domains,
                });

                await revalidateServerSidePath("/organization/sso");
                router.refresh();
                toast({
                    description: "SSO settings saved",
                    variant: "success",
                });
            } catch (error: any) {
                toast({
                    title: "Error",
                    description: error.message,
                    variant: "danger",
                });
                console.error(error);
            }
        },
    );

    const handleMetadataFetch = async () => {
        if (!metadataUrl) return;

        try {
            const { idpIssuer, entryPoint, cert, success, error } =
                await fetchAndParseMetadata(metadataUrl);

            if (!success) {
                throw new Error(error);
            }

            setValue("providerConfig.idpIssuer", idpIssuer);
            setValue("providerConfig.entryPoint", entryPoint);
            setValue("providerConfig.cert", cert);
            form.trigger();
        } catch (error) {
            toast({
                title: "Error",
                description:
                    "Failed to fetch metadata. Please check the URL and try again.",
                variant: "danger",
            });
        }
    };

    const handleFileUpload = async (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);

        try {
            const fileContent = await file.text();
            const { idpIssuer, entryPoint, cert, success, error } =
                await parseMetadataFromFile(fileContent);

            if (!success) {
                throw new Error(error);
            }

            setValue("providerConfig.idpIssuer", idpIssuer);
            setValue("providerConfig.entryPoint", entryPoint);
            setValue("providerConfig.cert", cert);
            form.trigger();

            toast({
                description: "Metadata uploaded successfully",
                variant: "success",
            });
        } catch (error) {
            console.error("File upload error:", error);
            toast({
                title: "Error",
                description:
                    "Failed to parse metadata file. Please make sure it's a valid SAML metadata XML file.",
                variant: "danger",
            });
        } finally {
            setIsUploading(false);
            // Reset the file input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const isEnabled = watch("active");

    return (
        <Page.Root>
            <form onSubmit={handleSubmit(saveSettings)}>
                <Page.Header>
                    <Page.Title>SSO Settings</Page.Title>
                    <Page.HeaderActions>
                        <Button
                            type="submit"
                            size="md"
                            variant="primary"
                            leftIcon={<Save />}
                            disabled={
                                !isDirty || !isValid || isLoadingSubmitButton
                            }
                            loading={isLoadingSubmitButton}>
                            Save settings
                        </Button>
                    </Page.HeaderActions>
                </Page.Header>

                <Page.Content className="flex flex-col gap-8">
                    <Card color="lv1" className="w-full max-w-3xl">
                        <CardHeader className="space-y-6">
                            <div className="space-y-1">
                                <h3 className="text-lg font-semibold">
                                    SAML SSO Configuration
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Configure SAML Single Sign-On for your
                                    organization
                                </p>
                            </div>

                            <div className="space-y-6">
                                <Controller
                                    name="active"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="flex items-center space-x-3">
                                            <Switch
                                                id="enable-sso"
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                            <Label
                                                htmlFor="enable-sso"
                                                className="text-sm font-medium">
                                                Enable SAML SSO
                                            </Label>
                                        </div>
                                    )}
                                />

                                {isEnabled && (
                                    <div className="space-y-6 border-t border-gray-200 pt-6">
                                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-1">
                                            <div className="space-y-4">
                                                <FormControl.Root>
                                                    <FormControl.Label>
                                                        Metadata URL (optional)
                                                    </FormControl.Label>
                                                    <div className="flex space-x-2">
                                                        <Input
                                                            placeholder="https://idp.example.com/metadata.xml"
                                                            value={metadataUrl}
                                                            onChange={(e) =>
                                                                setMetadataUrl(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="flex-1"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="primary"
                                                            size="md"
                                                            onClick={
                                                                handleMetadataFetch
                                                            }
                                                            disabled={
                                                                !metadataUrl ||
                                                                isUploading
                                                            }>
                                                            Fetch
                                                        </Button>
                                                    </div>
                                                </FormControl.Root>

                                                <div className="relative">
                                                    <div className="absolute inset-0 flex items-center">
                                                        <div className="w-full border-t border-gray-200"></div>
                                                    </div>
                                                    <div className="relative flex justify-center text-sm">
                                                        <span className="bg-card-lv1 px-2 text-gray-500">
                                                            or
                                                        </span>
                                                    </div>
                                                </div>

                                                <div>
                                                    <Button
                                                        type="button"
                                                        variant="secondary"
                                                        size="md"
                                                        onClick={
                                                            handleUploadClick
                                                        }
                                                        disabled={isUploading}
                                                        className="w-full">
                                                        <Upload className="mr-2 h-4 w-4" />
                                                        {isUploading
                                                            ? "Uploading..."
                                                            : "Upload Metadata XML File"}
                                                    </Button>
                                                    <input
                                                        type="file"
                                                        ref={fileInputRef}
                                                        onChange={
                                                            handleFileUpload
                                                        }
                                                        accept=".xml"
                                                        className="hidden"
                                                    />
                                                </div>

                                                <FormControl.Helper>
                                                    Provide a metadata URL or
                                                    upload an XML file to
                                                    auto-fill the fields below
                                                </FormControl.Helper>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                            <FormControl.Root>
                                                <FormControl.Label>
                                                    Service Provider Entity ID
                                                </FormControl.Label>
                                                <Controller
                                                    name="providerConfig.issuer"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Input
                                                            {...field}
                                                            value={
                                                                field.value ||
                                                                "kodus-orchestrator"
                                                            }
                                                            placeholder="kodus-orchestrator"
                                                        />
                                                    )}
                                                />
                                                <FormControl.Helper>
                                                    Entity ID for this service
                                                    provider (default:
                                                    kodus-orchestrator)
                                                </FormControl.Helper>
                                            </FormControl.Root>

                                            <FormControl.Root>
                                                <FormControl.Label>
                                                    IDP Issuer
                                                </FormControl.Label>
                                                <Controller
                                                    name="providerConfig.idpIssuer"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Input
                                                            {...field}
                                                            placeholder="urn:example:sp"
                                                        />
                                                    )}
                                                />
                                                <FormControl.Error>
                                                    {
                                                        errors.providerConfig
                                                            ?.idpIssuer?.message
                                                    }
                                                </FormControl.Error>
                                                <FormControl.Helper>
                                                    Entity ID of your identity
                                                    provider
                                                </FormControl.Helper>
                                            </FormControl.Root>
                                        </div>

                                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-1">
                                            <FormControl.Root>
                                                <FormControl.Label>
                                                    SSO URL
                                                </FormControl.Label>
                                                <Controller
                                                    name="providerConfig.entryPoint"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Input
                                                            {...field}
                                                            placeholder="https://idp.example.com/sso"
                                                        />
                                                    )}
                                                />
                                                <FormControl.Error>
                                                    {
                                                        errors.providerConfig
                                                            ?.entryPoint
                                                            ?.message
                                                    }
                                                </FormControl.Error>
                                                <FormControl.Helper>
                                                    Your IdP's SSO endpoint
                                                </FormControl.Helper>
                                            </FormControl.Root>
                                        </div>

                                        <div className="grid grid-cols-1 gap-6">
                                            <FormControl.Root>
                                                <FormControl.Label>
                                                    X.509 Certificate
                                                </FormControl.Label>
                                                <Controller
                                                    name="providerConfig.cert"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Textarea
                                                            {...field}
                                                            placeholder="-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----"
                                                            rows={6}
                                                            className="font-mono text-sm"
                                                        />
                                                    )}
                                                />
                                                <FormControl.Error>
                                                    {
                                                        errors.providerConfig
                                                            ?.cert?.message
                                                    }
                                                </FormControl.Error>
                                                <FormControl.Helper>
                                                    The public certificate from
                                                    your IdP in PEM format
                                                </FormControl.Helper>
                                            </FormControl.Root>
                                        </div>

                                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-1">
                                            <FormControl.Root>
                                                <FormControl.Label>
                                                    Identifier Format
                                                </FormControl.Label>
                                                <input
                                                    type="hidden"
                                                    {...form.register(
                                                        "providerConfig.identifierFormat",
                                                    )}
                                                />
                                                <div className="bg-muted text-muted-foreground flex h-10 items-center rounded-md border px-3 py-2 text-sm">
                                                    urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress
                                                </div>
                                                <FormControl.Helper>
                                                    The identifier format is
                                                    fixed to email address
                                                    format. This cannot be
                                                    changed. Ensure your IdP is
                                                    configured to use this
                                                    format.
                                                </FormControl.Helper>
                                            </FormControl.Root>
                                        </div>

                                        <FormControl.Root>
                                            <FormControl.Label>
                                                Allowed Domains
                                            </FormControl.Label>
                                            <Controller
                                                name="domains"
                                                control={control}
                                                render={({
                                                    field,
                                                    fieldState,
                                                }) => (
                                                    <>
                                                        <Input
                                                            placeholder="e.g., yourcompany.com"
                                                            error={
                                                                fieldState.error
                                                            }
                                                            value={
                                                                field.value?.join(
                                                                    ",",
                                                                ) ?? ""
                                                            }
                                                            onChange={(e) => {
                                                                const inputValue =
                                                                    e.target
                                                                        .value;

                                                                if (
                                                                    inputValue ===
                                                                    ""
                                                                ) {
                                                                    field.onChange(
                                                                        [],
                                                                    );
                                                                    return;
                                                                }

                                                                const domains =
                                                                    e.target.value
                                                                        .split(
                                                                            /\s*,\s*/,
                                                                        )
                                                                        .map(
                                                                            (
                                                                                d,
                                                                            ) =>
                                                                                d.trim(),
                                                                        );
                                                                field.onChange(
                                                                    domains,
                                                                );
                                                            }}
                                                            className="mt-3"
                                                        />
                                                        <FormControl.Error>
                                                            {
                                                                errors.domains
                                                                    ?.message
                                                            }
                                                        </FormControl.Error>
                                                        <FormControl.Helper>
                                                            Enter domains
                                                            separated by commas.
                                                            Only users with
                                                            email addresses from
                                                            these domains will
                                                            be able to sign in
                                                            via SSO.
                                                        </FormControl.Helper>
                                                    </>
                                                )}
                                            />
                                        </FormControl.Root>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                    </Card>
                </Page.Content>
            </form>
        </Page.Root>
    );
};

"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Page } from "@components/ui/page";
import { Spinner } from "@components/ui/spinner";
import { useEffectOnce } from "@hooks/use-effect-once";
import { finishOauthMCPPluginInstallation } from "@services/mcp-manager/fetch";
import { revalidateServerSidePath } from "src/core/utils/revalidate-server-side";

import ErrorComponent from "./_components/error";
import SuccessComponent from "./_components/success";

const componentsMap = {
    success: SuccessComponent,
    error: ErrorComponent,
    loading: () => <Spinner className="size-10" />,
};

export default function MCPOauthPage() {
    const searchParams = useSearchParams();
    const integrationId = searchParams.get("integrationId")!;
    const status = searchParams.get("status")!;
    const appName = searchParams.get("appName")!;

    const [installationStatus, setInstallationStatus] = useState<
        "success" | "error" | "loading"
    >("loading");

    useEffectOnce(() => {
        if (status !== "success") {
            return setInstallationStatus("error");
        }

        const timeout = setTimeout(() => {
            finishOauthMCPPluginInstallation({
                id: integrationId,
            })
                .then(async (a) => {
                    await revalidateServerSidePath("/settings/plugins");
                    setInstallationStatus("success");
                })
                .catch((e) => {
                    setInstallationStatus("error");
                });
        }, 1000);

        return () => {
            clearTimeout(timeout);
        };
    });

    const Component = componentsMap[installationStatus];

    return (
        <Page.Root className="items-center justify-center">
            <Component />

            <span className="text-2xl">
                Installing plugin{" "}
                <div className="inline-block font-bold capitalize">
                    {appName}
                </div>
            </span>
        </Page.Root>
    );
}

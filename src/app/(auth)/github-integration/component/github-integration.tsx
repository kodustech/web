"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@components/ui/card";
import { Spinner } from "@components/ui/spinner";
import { toast } from "@components/ui/toaster/use-toast";
import { useGetGithubIntegrationByInstallId } from "@services/setup/hooks";
import { InstallationStatus } from "@services/setup/types";
import { CopyIcon } from "lucide-react";

export default function GithubIntegrationClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const installationId = searchParams.get("installation_id");

    const { data, isLoading } = useGetGithubIntegrationByInstallId(
        installationId ?? "",
    );

    function loginToDoIntegration() {
        router.push(`/setup/github?installation_id=${installationId}`);
    }

    function copyLink() {
        navigator.clipboard.writeText(
            `${window.location.origin}/setup/github?installation_id=${installationId}`,
        );

        toast({
            title: "Copied to clipboard",
            variant: "info",
        });
    }

    if (isLoading) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Spinner />
            </div>
        );
    }

    if (data?.status === InstallationStatus.SUCCESS) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Card className="w-lg">
                    <CardHeader>
                        <CardTitle>
                            GitHub integration with{" "}
                            <span className="text-primary-light">
                                {data?.organizationName}
                            </span>{" "}
                            successfully completed!
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <p className="text-text-secondary text-sm">
                            You can now close this window.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex h-full w-full items-center justify-center">
            <Card className="w-lg">
                <CardHeader>
                    <CardTitle>
                        The automatic integration could not be completed.
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <p className="text-text-secondary text-sm">
                        Click the button below to log in with the account that
                        requested the integration, or copy the link and send it
                        to the person responsible for the account.
                    </p>
                </CardContent>

                <CardFooter className="justify-between">
                    <Button
                        size="md"
                        variant="cancel"
                        className="px-0"
                        leftIcon={<CopyIcon />}
                        onClick={copyLink}>
                        Copy link
                    </Button>

                    <Button
                        size="md"
                        variant="primary"
                        onClick={loginToDoIntegration}>
                        Login
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

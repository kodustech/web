"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@components/ui/button";
import Loading from "@components/ui/loading";
import { useGetGithubIntegrationByInstallId } from "@services/setup/hooks";
import { InstallationStatus } from "@services/setup/types";

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
    }

    if (isLoading) {
        return <Loading />;
    }

    if (data?.status === InstallationStatus.SUCCESS) {
        return (
            <div className="flex flex-col gap-10 text-center">
                <span className="text-[26px] font-semibold">
                    GitHub integration with {data?.organizationName} successfully completed!
                </span>
                <span className="text-[22px] font-medium">
                    You can now close this window.
                </span>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-24 text-justify">
            <span className="w-[80%] text-[22px] font-semibold xl:w-[65%] 2xl:w-[50%]">
                The automatic integration could not be completed. 
                Click the button below to log in with the account 
                that requested the integration, or copy the link 
                and send it to the person responsible for the account.
            </span>

            <div className="flex gap-4">
                <Button
                    className="focus:ring-brand-orange/20 min-h-[50px] w-[150px] rounded-[5px] bg-[#382A41] text-[18px] font-semibold text-white transition-all duration-150 hover:brightness-110 focus:ring-1"
                    onClick={loginToDoIntegration}>
                    Login
                </Button>
                <Button
                    className="bg-gradient min-h-[50px] w-[150px] self-center overflow-hidden rounded-[5px] p-[2px] hover:cursor-pointer"
                    onClick={copyLink}>
                    <div className="flex size-full items-center justify-center gap-2 rounded-[5px] bg-[#14121766] px-6 transition-all duration-150 hover:bg-[#1412174D] active:bg-[#14121780]">
                        <p className="text-[18px] font-semibold text-white">
                            Copy link
                        </p>
                    </div>
                </Button>
            </div>
        </div>
    );
}

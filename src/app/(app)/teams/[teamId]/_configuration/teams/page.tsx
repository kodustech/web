"use client";

import React, { use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@components/ui/button";
import Loading from "@components/ui/loading";
import {
    useGetTeamsStoryUrlId,
    useVerifyConnectionCommunication,
} from "@services/setup/hooks";
import { revalidateServerSidePath } from "src/core/utils/revalidate-server-side";

import styles from "./styles.module.css";

const Configuration = (props: { params: Promise<{ teamId: string }> }) => {
    const params = use(props.params);
    const { replace } = useRouter();
    const [url, setUrl] = React.useState("");

    const { data, isLoading } = useGetTeamsStoryUrlId();
    const {
        data: verifyData,
        isLoading: verifyLoading,
        refetch,
    } = useVerifyConnectionCommunication();

    React.useEffect(() => {
        const interval = setInterval(() => {
            async function checkTeamsIntegrationApp() {
                refetch();
            }

            checkTeamsIntegrationApp();
        }, 10000);

        return () => {
            clearInterval(interval);
        };
    }, [refetch]);

    React.useEffect(() => {
        if (data?.url) setUrl(data?.url);
    }, [data]);

    React.useEffect(() => {
        if (verifyData?.isSetupComplete) {
            revalidateServerSidePath(
                `/teams/${params.teamId}/integrations`,
            ).then(() => {
                replace(`/teams/${params.teamId}/integrations`);
            });
        }
    }, [replace, verifyData]);

    function openLink() {
        window.open(url, "_blank");
    }

    if (verifyLoading || isLoading)
        return (
            <div>
                <Loading />
            </div>
        );

    return (
        <div className={styles.root}>
            <div className={styles.title}>
                {" "}
                <span>
                    Click the link below to access the Teams store and install
                    our app. Notifications will be sent where you install the
                    app, so if you want your team to receive notifications from
                    Kody, install it on your team&apos;s channel.
                </span>
                <span>
                    After installation, this page will be updated automatically.
                </span>
                <div className={styles.ellipsis}></div>
            </div>
            <Button
                className="bg-gradient min-h-[50px] w-40 overflow-hidden rounded-[5px] p-[2px] hover:cursor-pointer"
                disabled={isLoading}
                onClick={openLink}>
                <div className="flex size-full items-center justify-center gap-2 rounded-[5px] bg-[#14121766] transition-all duration-150 active:bg-[#14121780] hover:bg-[#1412174D]">
                    <p className="pb-1 text-[18px] font-normal text-white">
                        Open app
                    </p>
                </div>
            </Button>
        </div>
    );
};

export default Configuration;

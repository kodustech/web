"use client";

import { startTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@components/ui/button";
import { CardContent } from "@components/ui/card";
import { DeployFrequencyAnalyticsHeader } from "src/features/ee/cockpit/@deployFrequencyAnalytics/_components/header";

export default function ErrorPage({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const router = useRouter();

    return (
        <>
            <DeployFrequencyAnalyticsHeader />

            <CardContent className="text-text-secondary -mt-4 flex h-full w-full flex-col items-center justify-center gap-2 text-center text-sm">
                <span className="w-40">
                    It looks like we couldn't fetch the data.
                </span>

                <Button
                    size="xs"
                    variant="primary-dark"
                    onClick={() => {
                        startTransition(() => {
                            reset();
                            router.refresh();
                        });
                    }}>
                    Try again
                </Button>
            </CardContent>
        </>
    );
}

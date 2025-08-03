import { CardContent, CardFooter } from "@components/ui/card";
import { Skeleton } from "@components/ui/skeleton";
import { DeployFrequencyAnalyticsHeader } from "src/features/ee/cockpit/@deployFrequencyAnalytics/_components/header";

export default function Loading() {
    return (
        <>
            <DeployFrequencyAnalyticsHeader>
                <Skeleton className="h-4 w-16" />
            </DeployFrequencyAnalyticsHeader>

            <CardContent className="flex items-center justify-center text-3xl font-bold">
                <Skeleton className="h-10 w-1/2" />
            </CardContent>

            <CardFooter className="text-text-secondary flex gap-1 text-xs">
                <Skeleton className="h-4 w-3/5" />
            </CardFooter>
        </>
    );
}

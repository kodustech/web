import { CardContent, CardFooter } from "@components/ui/card";
import { Skeleton } from "@components/ui/skeleton";
import { PRCycleTimeAnalyticsHeader } from "src/features/ee/cockpit/@prCycleTimeAnalytics/_components/header";

export default function Loading() {
    return (
        <>
            <PRCycleTimeAnalyticsHeader>
                <Skeleton className="h-4 w-32" />
            </PRCycleTimeAnalyticsHeader>

            <CardContent className="flex items-center justify-center text-3xl font-bold">
                <Skeleton className="h-10 w-1/2" />
            </CardContent>

            <CardFooter className="text-text-secondary flex gap-1 text-xs">
                <Skeleton className="h-4 w-3/5" />
            </CardFooter>
        </>
    );
}

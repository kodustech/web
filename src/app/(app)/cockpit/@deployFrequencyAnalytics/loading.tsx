import {
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@components/ui/card";
import { Skeleton } from "@components/ui/skeleton";

export default function Loading() {
    return (
        <>
            <CardHeader>
                <div className="flex justify-between">
                    <CardTitle className="text-sm">Deploy Frequency</CardTitle>

                    <Skeleton className="h-4 w-16" />
                </div>
            </CardHeader>

            <CardContent className="flex items-center justify-center text-3xl font-bold">
                <Skeleton className="h-10 w-1/2" />
            </CardContent>

            <CardFooter className="flex gap-1 text-xs text-muted-foreground">
                <Skeleton className="h-4 w-3/5" />
            </CardFooter>
        </>
    );
}

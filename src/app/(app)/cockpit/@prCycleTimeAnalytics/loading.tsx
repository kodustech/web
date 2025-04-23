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
                    <CardTitle className="text-sm">
                        PR Cycle Time
                        <small className="text-text-secondary ml-1">
                            (p75)
                        </small>
                    </CardTitle>

                    <Skeleton className="h-4 w-32" />
                </div>
            </CardHeader>

            <CardContent className="flex items-center justify-center text-3xl font-bold">
                <Skeleton className="h-10 w-1/2" />
            </CardContent>

            <CardFooter className="text-text-secondary flex gap-1 text-xs">
                <Skeleton className="h-4 w-3/5" />
            </CardFooter>
        </>
    );
}

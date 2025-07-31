import { CardContent } from "@components/ui/card";
import { Skeleton } from "@components/ui/skeleton";

export default function Loading() {
    return (
        <>
            <CardContent className="flex min-h-60 items-center justify-center text-3xl font-bold">
                <Skeleton className="h-full" />
            </CardContent>
        </>
    );
}

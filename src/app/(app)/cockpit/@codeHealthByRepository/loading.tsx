import { CardContent } from "@components/ui/card";
import { Skeleton } from "@components/ui/skeleton";

export default function Loading() {
    return (
        <>
            <CardContent className="flex items-center justify-center text-3xl font-bold">
                <Skeleton className="h-60" />
            </CardContent>
        </>
    );
}

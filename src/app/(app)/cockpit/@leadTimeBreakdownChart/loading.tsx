import { CardContent } from "@components/ui/card";
import { Skeleton } from "@components/ui/skeleton";

export default function Loading() {
    return (
        <>
            <CardContent>
                <Skeleton className="h-full" />
            </CardContent>
        </>
    );
}

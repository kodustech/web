import { CardContent } from "@components/ui/card";
import { Skeleton } from "@components/ui/skeleton";

export default function Loading() {
    return (
        <CardContent className="px-0 pb-0">
            <Skeleton className="h-60 rounded-none" />
        </CardContent>
    );
}

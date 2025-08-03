import { Skeleton } from "@components/ui/skeleton";

export default function Loading() {
    return (
        <>
            <div className="flex h-full w-full gap-4 px-6 pb-6">
                <Skeleton className="h-full w-full" />
            </div>
        </>
    );
}

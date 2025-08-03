"use client";

export default function ErrorPage({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="text-text-secondary -mt-4 flex h-full w-full items-center justify-center py-16 text-center text-sm">
            <span className="w-40">
                It looks like we couldn't fetch the data.
            </span>
        </div>
    );
}

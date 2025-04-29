"use client";

const errorMessages: Record<string, string> = {
    NO_DATA: "No data available.",
    DEFAULT: "It looks like we couldn't fetch the data.",
};

export default function ErrorPage({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="text-text-secondary flex h-full w-full items-center justify-center text-sm">
            <span className="-mt-10">
                {errorMessages[error.message] ?? errorMessages.DEFAULT}
            </span>
        </div>
    );
}

"use client";

import { CardContent, CardHeader, CardTitle } from "@components/ui/card";

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
        <>
            <CardHeader>
                <CardTitle className="text-sm">
                    PR Cycle Time
                    <small className="text-text-secondary ml-1">(p75)</small>
                </CardTitle>
            </CardHeader>

            <CardContent>
                <div className="text-text-secondary flex h-full w-full items-center justify-center text-center text-sm">
                    <span className="-mt-5">
                        {errorMessages[error.message] ?? errorMessages.DEFAULT}
                    </span>
                </div>
            </CardContent>
        </>
    );
}

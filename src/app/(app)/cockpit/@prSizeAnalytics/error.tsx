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
                    PR Size
                    <small className="ml-1 text-muted-foreground">(p75)</small>
                </CardTitle>
            </CardHeader>

            <CardContent>
                <div className="flex h-full w-full items-center justify-center text-center text-sm text-muted-foreground">
                    {errorMessages[error.message] ?? errorMessages.DEFAULT}
                </div>
            </CardContent>
        </>
    );
}

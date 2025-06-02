"use client";

import { CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { CockpitNoDataPlaceholder } from "src/features/ee/cockpit/_components/no-data-placeholder";

const errorMessages = {
    NO_DATA: () => <CockpitNoDataPlaceholder mini />,
    DEFAULT: () => (
        <span className="w-40">It looks like we couldn't fetch the data.</span>
    ),
} as const satisfies Record<string, () => React.JSX.Element>;

export default function ErrorPage({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const Component =
        errorMessages[error.message as keyof typeof errorMessages] ??
        errorMessages.DEFAULT;

    return (
        <>
            <CardHeader>
                <CardTitle className="text-sm">Bug Ratio</CardTitle>
            </CardHeader>

            <CardContent className="text-text-secondary -mt-4 flex h-full w-full items-center justify-center text-center text-sm">
                <Component />
            </CardContent>
        </>
    );
}

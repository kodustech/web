"use client";

import { CockpitNoDataPlaceholder } from "src/features/ee/cockpit/_components/no-data-placeholder";

const errorMessages = {
    NO_DATA: () => <CockpitNoDataPlaceholder />,
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
        <div className="text-text-secondary -mt-4 flex h-full w-full items-center justify-center py-16 text-center text-sm">
            <Component />
        </div>
    );
}

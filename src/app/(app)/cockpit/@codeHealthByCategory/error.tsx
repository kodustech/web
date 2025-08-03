"use client";

import { startTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@components/ui/button";
import { Card, CardHeader } from "@components/ui/card";

export default function ErrorPage({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const router = useRouter();

    return (
        <Card className="col-span-3">
            <CardHeader className="flex h-full items-center justify-center text-center">
                <span className="text-text-secondary w-40 text-sm">
                    It looks like we couldn't fetch the data.
                </span>

                <Button
                    size="xs"
                    variant="primary-dark"
                    onClick={() => {
                        startTransition(() => {
                            reset();
                            router.refresh();
                        });
                    }}>
                    Try again
                </Button>
            </CardHeader>
        </Card>
    );
}

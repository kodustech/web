import { useState } from "react";
import { Button } from "@components/ui/button";
import { Share2Icon } from "lucide-react";
import { ClipboardHelpers } from "src/core/utils/clipboard";
import { cn } from "src/core/utils/components";

export const ShareButton = () => {
    const [wasRecentlyCopiedToClipboard, setWasRecentlyCopiedToClipboard] =
        useState(false);

    return (
        <Button
            size="xs"
            variant="helper"
            disabled={wasRecentlyCopiedToClipboard}
            data-disabled={undefined}
            className={cn(
                "min-w-21",
                wasRecentlyCopiedToClipboard && "pointer-events-none",
            )}
            leftIcon={!wasRecentlyCopiedToClipboard && <Share2Icon />}
            onClick={async () => {
                try {
                    await ClipboardHelpers.copyTextToClipboard(
                        window.location.toString(),
                    );
                    setWasRecentlyCopiedToClipboard(true);

                    setTimeout(() => {
                        setWasRecentlyCopiedToClipboard(false);
                    }, 1500);
                } catch (error) {}
            }}>
            {wasRecentlyCopiedToClipboard ? (
                <span className="text-success font-semibold">Copied!</span>
            ) : (
                "Share"
            )}
        </Button>
    );
};

"use client";

import { Suspense, useEffect } from "react";
import { Button } from "@components/ui/button";
import { Sheet, SheetTrigger } from "@components/ui/sheet";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@components/ui/tooltip";
import { Eye } from "lucide-react";
import { cn } from "src/core/utils/components";

import { DryRunSidebar } from "./dry-run-sidebar";

interface PreviewSidebarButtonProps {
    className?: string;
}

export const PreviewSidebarButton = ({
    className,
}: PreviewSidebarButtonProps) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Cmd/Ctrl + Shift + P
            if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "P") {
                e.preventDefault();
                document
                    .querySelector<HTMLButtonElement>("[data-preview-button]")
                    ?.click();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <Sheet>
            <Suspense>
                <TooltipProvider>
                    <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                            <SheetTrigger asChild>
                                <button
                                    data-preview-button
                                    className={cn(
                                        "group relative flex flex-col items-center justify-center",
                                        "w-full px-2 py-4",
                                        "text-text-tertiary hover:text-text-primary",
                                        "hover:bg-background-tertiary transition-all duration-200",
                                        "cursor-pointer border-0 bg-transparent",
                                        className,
                                    )}>
                                    <Eye className="mb-2 size-5" />
                                    <span
                                        className="text-md leading-tight font-medium tracking-tight"
                                        style={{
                                            writingMode: "vertical-rl",
                                            textOrientation: "mixed",
                                        }}>
                                        Preview
                                    </span>
                                </button>
                            </SheetTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="left" sideOffset={10}>
                            <div className="flex flex-col gap-1">
                                <span className="font-semibold">Preview</span>
                                <span className="text-text-tertiary text-[11px]">
                                    ⌘⇧P
                                </span>
                            </div>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <DryRunSidebar />
            </Suspense>
        </Sheet>
    );
};

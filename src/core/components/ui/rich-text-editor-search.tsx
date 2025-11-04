"use client";

import * as React from "react";
import { Editor } from "@tiptap/react";
import { Search, X } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { cn } from "src/core/utils/components";

type RichTextEditorSearchProps = {
    editor: Editor | null;
    className?: string;
};

export function RichTextEditorSearch({ editor, className }: RichTextEditorSearchProps) {
    const [searchTerm, setSearchTerm] = React.useState("");
    const [isOpen, setIsOpen] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "f") {
                e.preventDefault();
                setIsOpen(true);
                setTimeout(() => inputRef.current?.focus(), 0);
            }
            if (e.key === "Escape" && isOpen) {
                setIsOpen(false);
                setSearchTerm("");
                (editor?.commands as any).clearSearch();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [editor, isOpen]);

    React.useEffect(() => {
        if (!editor) return;

        if (searchTerm) {
            (editor.commands as any).setSearchTerm(searchTerm, false);
        } else {
            (editor.commands as any).clearSearch();
        }
    }, [searchTerm, editor]);

    if (!editor || !isOpen) return null;

    return (
        <div
            className={cn(
                "flex items-center gap-2 rounded-lg border border-card-lv3 bg-card-lv2 p-2",
                className,
            )}>
            <Search className="size-4 text-text-secondary" />
            <Input
                ref={inputRef}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search... (Esc to close)"
                className="h-8 flex-1 border-0 bg-transparent focus:ring-0"
                autoFocus
            />
            {searchTerm && (
                <Button
                    type="button"
                    variant="cancel"
                    size="icon-sm"
                    onClick={() => {
                        setSearchTerm("");
                        (editor.commands as any).clearSearch();
                    }}
                    className="h-7 w-7">
                    <X className="size-3" />
                </Button>
            )}
        </div>
    );
}


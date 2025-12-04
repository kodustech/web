"use client";

import * as React from "react";
import { Editor } from "@tiptap/react";
import { Bold, Italic, Code, Code2, Heading1, Heading2, Heading3, List, ListOrdered, Quote, Link, Minus } from "lucide-react";
import { Button } from "./button";
import { cn } from "src/core/utils/components";

type RichTextEditorToolbarProps = {
    editor: Editor | null;
    className?: string;
    extraActions?: React.ReactNode;
};

export function RichTextEditorToolbar({ editor, className, extraActions }: RichTextEditorToolbarProps) {
    if (!editor) return null;

    return (
        <div
            className={cn(
                "flex flex-wrap items-center gap-1 rounded-lg border border-card-lv3 bg-card-lv2 p-1",
                className,
            )}>
            {/* Text Formatting */}
            <Button
                type="button"
                variant="cancel"
                size="icon-sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={cn(
                    "h-7 w-7",
                    editor.isActive("bold") && "bg-primary/10 text-primary",
                )}
                title="Bold (⌘B)">
                <Bold className="size-4" />
            </Button>

            <Button
                type="button"
                variant="cancel"
                size="icon-sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={cn(
                    "h-7 w-7",
                    editor.isActive("italic") && "bg-primary/10 text-primary",
                )}
                title="Italic (⌘I)">
                <Italic className="size-4" />
            </Button>

            <Button
                type="button"
                variant="cancel"
                size="icon-sm"
                onClick={() => editor.chain().focus().toggleCode().run()}
                disabled={!editor.can().chain().focus().toggleCode().run()}
                className={cn(
                    "h-7 w-7",
                    editor.isActive("code") && "bg-primary/10 text-primary",
                )}
                title="Inline Code (⌘K)">
                <Code className="size-4" />
            </Button>

            <div className="mx-1 h-4 w-px bg-card-lv3" />

            {/* Headings */}
            <Button
                type="button"
                variant="cancel"
                size="icon-sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                disabled={!editor.can().chain().focus().toggleHeading({ level: 1 }).run()}
                className={cn(
                    "h-7 w-7",
                    editor.isActive("heading", { level: 1 }) && "bg-primary/10 text-primary",
                )}
                title="Heading 1">
                <Heading1 className="size-4" />
            </Button>

            <Button
                type="button"
                variant="cancel"
                size="icon-sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                disabled={!editor.can().chain().focus().toggleHeading({ level: 2 }).run()}
                className={cn(
                    "h-7 w-7",
                    editor.isActive("heading", { level: 2 }) && "bg-primary/10 text-primary",
                )}
                title="Heading 2">
                <Heading2 className="size-4" />
            </Button>

            <Button
                type="button"
                variant="cancel"
                size="icon-sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                disabled={!editor.can().chain().focus().toggleHeading({ level: 3 }).run()}
                className={cn(
                    "h-7 w-7",
                    editor.isActive("heading", { level: 3 }) && "bg-primary/10 text-primary",
                )}
                title="Heading 3">
                <Heading3 className="size-4" />
            </Button>

            <div className="mx-1 h-4 w-px bg-card-lv3" />

            {/* Lists */}
            <Button
                type="button"
                variant="cancel"
                size="icon-sm"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                disabled={!editor.can().chain().focus().toggleBulletList().run()}
                className={cn(
                    "h-7 w-7",
                    editor.isActive("bulletList") && "bg-primary/10 text-primary",
                )}
                title="Bullet List">
                <List className="size-4" />
            </Button>

            <Button
                type="button"
                variant="cancel"
                size="icon-sm"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                disabled={!editor.can().chain().focus().toggleOrderedList().run()}
                className={cn(
                    "h-7 w-7",
                    editor.isActive("orderedList") && "bg-primary/10 text-primary",
                )}
                title="Ordered List">
                <ListOrdered className="size-4" />
            </Button>

            <div className="mx-1 h-4 w-px bg-card-lv3" />

            {/* Blockquote & Code Block */}
            <Button
                type="button"
                variant="cancel"
                size="icon-sm"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                disabled={!editor.can().chain().focus().toggleBlockquote().run()}
                className={cn(
                    "h-7 w-7",
                    editor.isActive("blockquote") && "bg-primary/10 text-primary",
                )}
                title="Blockquote">
                <Quote className="size-4" />
            </Button>

            <Button
                type="button"
                variant="cancel"
                size="icon-sm"
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                disabled={!editor.can().chain().focus().toggleCodeBlock().run()}
                className={cn(
                    "h-7 w-7",
                    editor.isActive("codeBlock") && "bg-primary/10 text-primary",
                )}
                title="Code Block (⌘⌥C)">
                <Code2 className="size-4" />
            </Button>

            <div className="mx-1 h-4 w-px bg-card-lv3" />

            {/* Link & Horizontal Rule */}
            <Button
                type="button"
                variant="cancel"
                size="icon-sm"
                onClick={() => {
                    const url = window.prompt("Enter URL:");
                    if (url) {
                        editor.chain().focus().setLink({ href: url }).run();
                    }
                }}
                disabled={!editor.can().chain().focus().setLink({ href: "" }).run()}
                className={cn(
                    "h-7 w-7",
                    editor.isActive("link") && "bg-primary/10 text-primary",
                )}
                title="Link">
                <Link className="size-4" />
            </Button>

            <Button
                type="button"
                variant="cancel"
                size="icon-sm"
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                disabled={!editor.can().chain().focus().setHorizontalRule().run()}
                className="h-7 w-7"
                title="Horizontal Rule">
                <Minus className="size-4" />
            </Button>

            {extraActions && (
                <>
                    <div className="flex-1" />
                    <div className="mx-1 h-4 w-px bg-card-lv3" />
                    {extraActions}
                </>
            )}
        </div>
    );
}


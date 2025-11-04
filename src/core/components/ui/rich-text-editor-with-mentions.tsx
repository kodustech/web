"use client";

import * as React from "react";
import { RichTextEditor } from "./rich-text-editor";
import { Popover, PopoverAnchor, PopoverContent } from "./popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./command";

export type MentionGroupItem = {
    value: string;
    label: string;
    type?: string;
    meta?: Record<string, any>;
    children?: () => Promise<MentionGroup[]> | MentionGroup[];
};
export type MentionGroup = { groupLabel: string; items: MentionGroupItem[] };

type Props = {
    value: string | object;
    onChangeAction: (next: string | object) => void;
    groups: MentionGroup[];
    className?: string;
    placeholder?: string;
    saveFormat?: "json" | "text";
    formatInsertByType?: Partial<Record<string, (item: MentionGroupItem) => string>>;
};

export function RichTextEditorWithMentions(props: Props) {
    const { value, onChangeAction: onChange, className, placeholder, groups, saveFormat = "json", formatInsertByType } = props;
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const [triggerPos, setTriggerPos] = React.useState<number | null>(null);
    const [viewStack, setViewStack] = React.useState<MentionGroup[][]>([]);
    const [childSearchGroups, setChildSearchGroups] = React.useState<MentionGroup[] | null>(null);

    const editorRef = React.useRef<HTMLDivElement | null>(null);
    const editorInstanceRef = React.useRef<any>(null);

    // Memoize groups to prevent unnecessary useEffect re-runs
    const groupsRef = React.useRef(groups);
    React.useEffect(() => {
        groupsRef.current = groups;
    }, [groups]);

    const handleEditorRef = React.useCallback((el: HTMLDivElement | null) => {
        editorRef.current = el;
    }, []);

    const handleEditorInstance = React.useCallback((editor: any) => {
        editorInstanceRef.current = editor;
    }, []);

    const handleTrigger = React.useCallback((pos: number) => {
        // Reset all state when opening menu
        setTriggerPos(pos);
        setQuery("");
        setViewStack([]);
        setOpen(true);
    }, []);

    const insertToken = React.useCallback((item: MentionGroupItem) => {
        const editor = editorInstanceRef.current;
        if (!editor) {
            // Fallback to string manipulation if editor not ready
            const byType = (item.type && formatInsertByType?.[item.type]) || ((it: MentionGroupItem) => `@mcp<${it.label}>`);
            const token = byType(item);
            // Get text from value (handle both string and object)
            const cur = typeof value === "string" ? value : "";
            const afterAtPos = triggerPos ?? cur.length;
            let atPos = afterAtPos - 1;
            while (atPos >= 0 && cur[atPos] !== "@") {
                atPos--;
            }
            if (atPos < 0 || cur[atPos] !== "@") {
                const before = cur.slice(0, afterAtPos);
                const after = cur.slice(afterAtPos);
                onChange(`${before}${token} `);
            } else {
                const before = cur.slice(0, atPos);
                const after = cur.slice(afterAtPos);
                onChange(`${before}${token} `);
            }
            setOpen(false);
            setQuery("");
            setTriggerPos(null);
            setViewStack([]);
            setChildSearchGroups(null);
            return;
        }

        // Use Tiptap API to insert mention node
        const byType = (item.type && formatInsertByType?.[item.type]) || ((it: MentionGroupItem) => {
            const rawApp = String(it?.meta?.appName ?? "");
            const app = rawApp
                .toLowerCase()
                .replace(/\bmcp\b/g, "")
                .replace(/[^a-z0-9]+/g, "_")
                .replace(/^_+|_+$/g, "");
            const tool = String(it.label).toLowerCase();
            return { app, tool };
        });

        if (item.type === "mcp" && item.meta?.appName) {
            const rawApp = String(item.meta.appName);
            const app = rawApp
                .toLowerCase()
                .replace(/\bmcp\b/g, "")
                .replace(/[^a-z0-9]+/g, "_")
                .replace(/^_+|_+$/g, "");
            const tool = String(item.label).toLowerCase();

            // Find and delete "@" character, then insert mention
            const { state } = editor;
            const { selection } = state;
            let pos = selection.$from.pos;

            // Go backwards to find "@"
            let foundPos = pos;
            const $pos = state.doc.resolve(pos);
            let searchPos = $pos.pos;
            let found = false;

            // Search backwards up to 50 characters
            for (let i = 0; i < 50 && searchPos > 0; i++) {
                const char = state.doc.textBetween(searchPos - 1, searchPos);
                if (char === "@") {
                    foundPos = searchPos - 1;
                    found = true;
                    break;
                }
                searchPos--;
            }

            if (found) {
                editor
                    .chain()
                    .focus()
                    .setTextSelection({ from: foundPos, to: pos })
                    .deleteSelection()
                    .insertContent({
                        type: "mcpMention",
                        attrs: { app, tool },
                    })
                    .insertContent(" ")
                    .run();
            } else {
                // Fallback: insert at current position
                editor
                    .chain()
                    .focus()
                    .insertContent({
                        type: "mcpMention",
                        attrs: { app, tool },
                    })
                    .insertContent(" ")
                    .run();
            }

            // The editor's onUpdate will handle calling onChange
        } else {
            // Fallback for non-mcp items
            const token = byType(item);
            const cur = typeof value === "string" ? value : "";
            const afterAtPos = triggerPos ?? cur.length;
            let atPos = afterAtPos - 1;
            while (atPos >= 0 && cur[atPos] !== "@") {
                atPos--;
            }
            if (atPos >= 0 && cur[atPos] === "@") {
                const before = cur.slice(0, atPos);
                const after = cur.slice(afterAtPos);
                onChange(`${before}${token} `);
            } else {
                onChange(`${cur}${token} `);
            }
        }

        setOpen(false);
        setQuery("");
        setTriggerPos(null);
        setViewStack([]);
        setChildSearchGroups(null);
    }, [value, triggerPos, onChange, formatInsertByType]);

    const currentGroups = React.useMemo(() => {
        return viewStack.length ? viewStack[viewStack.length - 1] : groups;
    }, [viewStack, groups]);

    const canGoBack = viewStack.length > 0;
    const goBack = React.useCallback(() => {
        setViewStack((s) => (s.length ? s.slice(0, s.length - 1) : s));
    }, []);

    // Use AbortController to cancel pending requests and prevent race conditions
    React.useEffect(() => {
        const abortController = new AbortController();
        let active = true;

        const run = async () => {
            if (viewStack.length > 0 || !query) {
                setChildSearchGroups(null);
                return;
            }

            // Use current groups from ref to avoid stale closure
            const currentGroups = groupsRef.current;
            const searchQuery = query.toLowerCase();

            const loaders: Array<Promise<MentionGroup | null>> = [];

            for (const group of currentGroups) {
                for (const item of group.items) {
                    if (!item.children || abortController.signal.aborted) continue;

                    loaders.push(
                        (async () => {
                            try {
                                const getChildren = item.children!;
                                const children = await getChildren();

                                if (abortController.signal.aborted) return null;

                                const matchedItems = children.flatMap((g) =>
                                    g.items.filter((it) => it.label.toLowerCase().includes(searchQuery)),
                                );
                                if (matchedItems.length === 0) return null;
                                return {
                                    groupLabel: item.label,
                                    items: matchedItems,
                                } as MentionGroup;
                            } catch (error) {
                                // Silently ignore errors from aborted requests
                                return null;
                            }
                        })(),
                    );
                }
            }

            const results = await Promise.all(loaders);

            if (active && !abortController.signal.aborted) {
                const filteredResults = results.filter(Boolean) as MentionGroup[];
                setChildSearchGroups(filteredResults.length ? filteredResults : null);
            }
        };

        const timeoutId = setTimeout(run, 120);

        return () => {
            active = false;
            abortController.abort();
            clearTimeout(timeoutId);
        };
    }, [query, viewStack.length]);

    return (
        <Popover open={open} onOpenChange={(o) => {
            if (o) {
                setOpen(true);
            } else {
                setOpen(false);
                setQuery("");
                setViewStack([]);
                setChildSearchGroups(null);
            }
        }}>
            <div className="relative w-full">
                <PopoverAnchor asChild>
                    <div />
                </PopoverAnchor>
                <RichTextEditor
                    enableMentions
                    saveFormat={saveFormat}
                    editorRefAction={handleEditorRef}
                    editorInstanceAction={handleEditorInstance}
                    value={value}
                    onChangeAction={onChange}
                    onTriggerAction={handleTrigger}
                    className={className}
                    placeholder={placeholder}
                />
            </div>
            <PopoverContent className="p-0 w-80" align="start" sideOffset={8}>
                <Command>
                    {viewStack.length > 0 && (
                        <div className="flex items-center gap-2 px-3 py-2 text-xs text-text-secondary">
                            <span>Root</span>
                            {viewStack.map((g, idx) => (
                                <React.Fragment key={idx}>
                                    <span>/</span>
                                    <span>{g[0]?.groupLabel ?? ""}</span>
                                </React.Fragment>
                            ))}
                        </div>
                    )}
                    <CommandInput value={query} onValueChange={setQuery} placeholder="Digite para filtrar…" />
                    <CommandList>
                        <CommandEmpty>No results.</CommandEmpty>
                        {React.useMemo(() => {
                            const groupsToRender = childSearchGroups ?? currentGroups;
                            return groupsToRender.map((g) => {
                                const filteredItems = g.items.filter((it) =>
                                    it.label.toLowerCase().includes(query.toLowerCase()),
                                );
                                if (filteredItems.length === 0) return null;

                                return (
                                    <CommandGroup key={g.groupLabel} heading={g.groupLabel}>
                                        {filteredItems.map((it) => (
                                            <CommandItem
                                                key={it.value}
                                                value={it.label}
                                                onSelect={async () => {
                                                    if (it.children) {
                                                        const next = await it.children();
                                                        setViewStack((s) => [...s, next]);
                                                        setQuery("");
                                                    } else {
                                                        insertToken(it);
                                                    }
                                                }}
                                            >
                                                <span className="truncate">{it.label}</span>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                );
                            }).filter(Boolean);
                        }, [childSearchGroups, currentGroups, query, insertToken])}
                    </CommandList>
                </Command>
                {canGoBack && (
                    <div className="flex items-center justify-end border-t px-3 py-2">
                        <button
                            type="button"
                            className="text-xs text-text-secondary hover:underline"
                            onClick={goBack}
                        >
                            ← Back
                        </button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}

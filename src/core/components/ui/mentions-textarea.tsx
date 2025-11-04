"use client";

import * as React from "react";
import { cn } from "src/core/utils/components";

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./command";
import { Popover, PopoverAnchor, PopoverContent } from "./popover";
import { Textarea } from "./textarea";

type MentionGroupItem = {
    value: string;
    label: string;
    icon?: React.ReactNode;
    type?: "mcp" | "directory" | "file" | string;
    children?: () => Promise<MentionGroup[]> | MentionGroup[];
    meta?: Record<string, any>;
};

type MentionGroup = {
    groupLabel: string;
    items: MentionGroupItem[];
};

type MentionsTextareaProps = Omit<
    React.ComponentProps<typeof Textarea>,
    "onChange" | "value"
> & {
    value?: string;
    onChange?: (value: string) => void;
    groups?: MentionGroup[];
    /** String inserted when selecting an item. Defaults to "@${label} ". */
    formatInsert?: (item: MentionGroupItem) => string;
    /** Template per type; overrides formatInsert if provided */
    formatInsertByType?: Partial<Record<string, (item: MentionGroupItem) => string>>;
    /** Triggers to open the menu. Default: ["@", "/", "#"]. */
    triggers?: string[];
    /** Controlled open/query props */
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    query?: string;
    onQueryChange?: (q: string) => void;
    /** Async providers to fetch items by query */
    providers?: Array<{
        type: "mcp" | "directory" | "file" | string;
        groupLabel: string;
        search: (query: string) => Promise<MentionGroupItem[]> | MentionGroupItem[];
    }>;
    /** Custom item renderer */
    renderItem?: (item: MentionGroupItem) => React.ReactNode;
};

export function MentionsTextarea({
    className,
    value = "",
    onChange,
    groups,
    formatInsert = (item) => `@${item.label} `,
    formatInsertByType,
    triggers = ["@", "/", "#"],
    open: controlledOpen,
    onOpenChange,
    query: controlledQuery,
    onQueryChange,
    providers,
    renderItem,
    ...textareaProps
}: MentionsTextareaProps) {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
    const open = controlledOpen ?? uncontrolledOpen;

    const [uncontrolledQuery, setUncontrolledQuery] = React.useState("");
    const query = controlledQuery ?? uncontrolledQuery;
    const setQuery = (q: string) => {
        onQueryChange?.(q);
        setUncontrolledQuery(q);
    };
    const [triggerIndex, setTriggerIndex] = React.useState<number | null>(null);
    const [triggerChar, setTriggerChar] = React.useState<string | null>(null);
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
    const commandInputRef = React.useRef<HTMLInputElement | null>(null);
    const anchorRef = React.useRef<HTMLDivElement | null>(null);
    const wrapperRef = React.useRef<HTMLDivElement | null>(null);
    // visual caret overlay (to keep caret visible when textarea text is transparent)
    const caretVisualRef = React.useRef<HTMLDivElement | null>(null);

    // lightweight highlight overlay for @mcp<app|tool>
    const renderHighlighted = React.useCallback(() => {
        const text = value ?? "";
        const parts: Array<React.ReactNode> = [];
        const regex = /@mcp<([a-z0-9_]+)\|([a-z0-9_]+)>/gi;
        let lastIndex = 0;
        let match: RegExpExecArray | null;
        while ((match = regex.exec(text)) !== null) {
            const [full, app, tool] = match;
            if (match.index > lastIndex) {
                parts.push(text.slice(lastIndex, match.index));
            }
            parts.push(
                <span
                    key={`${match.index}`}
                    className="inline-flex items-baseline gap-1 rounded bg-primary/10 px-1.5 py-0.5 ring-1 ring-primary/20"
                >
                    <span className="text-text-secondary">@mcp</span>
                    <span className="text-text-secondary">&lt;</span>
                    <span className="text-primary-light font-medium">{app}</span>
                    <span className="text-text-secondary">|</span>
                    <span className="text-accent font-semibold">{tool}</span>
                    <span className="text-text-secondary">&gt;</span>
                </span>,
            );
            lastIndex = match.index + full.length;
        }
        if (lastIndex < text.length) parts.push(text.slice(lastIndex));
        return parts;
    }, [value]);

    const defaultGroups: MentionGroup[] = React.useMemo(
        () =>
            groups ?? [
                { groupLabel: "MCP", items: [{ value: "mcp", label: "mcp" }] },
                {
                    groupLabel: "Directory",
                    items: [{ value: "directory", label: "directory" }],
                },
                { groupLabel: "File", items: [{ value: "file", label: "file" }] },
            ],
        [groups],
    );

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const next = e.target.value;
        onChange?.(next);
        if (open && triggerIndex != null) {
            const caret = e.target.selectionStart ?? next.length;
            const slice = next.slice(triggerIndex, caret);
            setQuery(slice);
        }
        requestAnimationFrame(() => updateAnchorPosition());
    };

    const openMenu = React.useCallback((startIndex: number, trig: string) => {
        setTriggerIndex(startIndex);
        setTriggerChar(trig);
        setQuery("");
        setViewStack([]);
        setChildSearchGroups(null);
        onOpenChange?.(true);
        setUncontrolledOpen(true);
        // Move focus to command input on next tick
        setTimeout(() => commandInputRef.current?.focus(), 0);
    }, []);

    const closeMenu = React.useCallback(() => {
        onOpenChange?.(false);
        setUncontrolledOpen(false);
        setQuery("");
        setTriggerIndex(null);
        setTriggerChar(null);
        textareaRef.current?.focus();
    }, []);

    const isTrigger = (key: string) => triggers.includes(key);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        const target = e.currentTarget;
        const caret = target.selectionStart ?? value.length;
        // Shortcut: clear all @mcp tokens
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "k") {
            e.preventDefault();
            const text = value ?? "";
            const next = text.replace(/@mcp<[^>]+>/gi, "");
            onChange?.(next);
            return;
        }
        if (isTrigger(e.key)) {
            // stop '@' from going into the command input query
            e.preventDefault();

            // ensure '@' is inserted into the textarea at the caret position
            const currentText = value ?? "";
            const before = currentText.slice(0, caret);
            const after = currentText.slice(caret);
            const next = `${before}${e.key}${after}`;
            onChange?.(next);

            // move caret right after the trigger
            requestAnimationFrame(() => {
                if (textareaRef.current) {
                    const pos = caret + 1;
                    textareaRef.current.selectionStart = pos;
                    textareaRef.current.selectionEnd = pos;
                }
            });

            openMenu(caret + 1, e.key);
            return;
        }
        if (open) {
            if (e.key === "Escape") {
                e.preventDefault();
                closeMenu();
                return;
            }
            if (e.key === "Backspace" && triggerIndex != null && caret <= triggerIndex) {
                closeMenu();
                return;
            }
        }
        // Smart deletion of whole token
        if (e.key === "Backspace" || e.key === "Delete") {
            const text = value ?? "";
            const regex = /@mcp<[^>]+>/gi;
            let m: RegExpExecArray | null;
            while ((m = regex.exec(text)) !== null) {
                const start = m.index;
                const end = start + m[0].length;
                const hit = e.key === "Backspace" ? caret === end : caret === start;
                const inside = caret > start && caret < end;
                if (hit || inside) {
                    e.preventDefault();
                    const next = text.slice(0, start) + text.slice(end);
                    onChange?.(next);
                    requestAnimationFrame(() => {
                        if (textareaRef.current) {
                            textareaRef.current.selectionStart = start;
                            textareaRef.current.selectionEnd = start;
                        }
                    });
                    return;
                }
            }
        }
        // update overlay caret position after key handling
        setTimeout(() => updateAnchorPosition(), 0);
    };

    // Positioning: anchor near caret using a hidden mirror element
    const updateAnchorPosition = React.useCallback(() => {
        const textarea = textareaRef.current;
        const wrapper = wrapperRef.current;
        const anchor = anchorRef.current;
        const caretVisual = caretVisualRef.current;
        if (!textarea || !wrapper || !anchor) return;

        const style = window.getComputedStyle(textarea);
        const mirror = document.createElement("div");
        mirror.style.whiteSpace = "pre-wrap";
        mirror.style.wordWrap = "break-word";
        mirror.style.position = "absolute";
        mirror.style.visibility = "hidden";
        mirror.style.zIndex = "-1";
        const props = [
            "fontFamily",
            "fontSize",
            "lineHeight",
            "padding",
            "border",
            "letterSpacing",
            "textTransform",
            "width",
        ];
        props.forEach((p) => ((mirror.style as any)[p] = (style as any)[p]));
        mirror.textContent = (textarea.value || "").slice(0, textarea.selectionStart ?? 0);
        const caretMarker = document.createElement("span");
        caretMarker.textContent = "\u200b";
        mirror.appendChild(caretMarker);
        wrapper.appendChild(mirror);
        const rect = caretMarker.getBoundingClientRect();
        const parentRect = wrapper.getBoundingClientRect();
        const left = rect.left - parentRect.left;
        const top = rect.top - parentRect.top + 20;
        anchor.style.position = "absolute";
        anchor.style.left = `${left}px`;
        anchor.style.top = `${top}px`;
        if (caretVisual) {
            caretVisual.style.left = `${left}px`;
            caretVisual.style.top = `${top - 18}px`;
        }
        wrapper.removeChild(mirror);
    }, []);

    React.useEffect(() => {
        if (open) updateAnchorPosition();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, value]);

    const handleSelect = (item: MentionGroupItem) => {
        const text = value ?? "";
        const start = triggerIndex ?? text.length;
        const before = text.slice(0, start - 1); // include the trigger we typed
        const after = text.slice(start);
        const byType = item.type && formatInsertByType?.[item.type];
        const insertion = byType ? byType(item) : formatInsert(item);
        const next = `${before}${insertion}${after}`;
        onChange?.(next);

        // restore caret after the inserted content
        requestAnimationFrame(() => {
            const pos = (before + insertion).length;
            if (textareaRef.current) {
                textareaRef.current.selectionStart = pos;
                textareaRef.current.selectionEnd = pos;
            }
            closeMenu();
        });
    };

    // Providers: build groups from async results if provided
    const [providerResults, setProviderResults] = React.useState<MentionGroupItem[][]>([]);
    React.useEffect(() => {
        let active = true;
        const run = async () => {
            if (!providers || !open) {
                setProviderResults([]);
                return;
            }
            const tasks = providers.map(async (p) => {
                const res = await p.search(query);
                return res.map((r) => ({ ...r, type: r.type ?? p.type }));
            });
            const results = await Promise.all(tasks);
            if (active) setProviderResults(results);
        };
        const t = setTimeout(run, 120);
        return () => {
            active = false;
            clearTimeout(t);
        };
    }, [providers, query, open]);

    const combinedGroups: MentionGroup[] = React.useMemo(() => {
        if (providers && providerResults.length) {
            return providers.map((p, i) => ({ groupLabel: p.groupLabel, items: providerResults[i] ?? [] }));
        }
        return defaultGroups;
    }, [providers, providerResults, defaultGroups]);

    // Hierarchical navigation support (e.g., MCP -> App -> Tools)
    const [viewStack, setViewStack] = React.useState<MentionGroup[][]>([]);
    const currentGroups = viewStack.length ? viewStack[viewStack.length - 1] : combinedGroups;
    const canGoBack = viewStack.length > 0;
    const goBack = () => setViewStack((s) => (s.length ? s.slice(0, s.length - 1) : s));

    // When typing at root level, search within children of items (e.g., tools inside each MCP app)
    const [childSearchGroups, setChildSearchGroups] = React.useState<MentionGroup[] | null>(null);
    React.useEffect(() => {
        let active = true;
        const run = async () => {
            if (viewStack.length > 0 || !query) {
                setChildSearchGroups(null);
                return;
            }
            // collect matches from children providers
            const loaders: Array<Promise<MentionGroup | null>> = [];
            for (const group of combinedGroups) {
                for (const item of group.items) {
                    if (!item.children) continue;
                    loaders.push(
                        (async () => {
                            const getChildren = item.children!;
                            const children = await getChildren();
                            const matchedItems = children.flatMap((g) =>
                                g.items.filter((it) => it.label.toLowerCase().includes(query.toLowerCase())),
                            );
                            if (matchedItems.length === 0) return null;
                            return {
                                groupLabel: item.label,
                                items: matchedItems,
                            } as MentionGroup;
                        })(),
                    );
                }
            }
            const results = (await Promise.all(loaders)).filter(Boolean) as MentionGroup[];
            if (active) setChildSearchGroups(results.length ? results : null);
        };
        const t = setTimeout(run, 120);
        return () => {
            active = false;
            clearTimeout(t);
        };
    }, [query, viewStack.length, combinedGroups]);

    return (
        <Popover open={open} onOpenChange={(o) => (o ? setUncontrolledOpen(true) : closeMenu())}>
            <div ref={wrapperRef} className="relative w-full">
                <PopoverAnchor asChild>
                    <div ref={anchorRef} />
                </PopoverAnchor>
                {/* Overlay disabled to fix caret issues */}
                <Textarea
                    ref={textareaRef}
                    value={value}
                    onChange={handleTextareaChange}
                    onKeyDown={handleKeyDown}
                    onClick={() => open && updateAnchorPosition()}
                    onKeyUp={() => open && updateAnchorPosition()}
                    className={cn("w-full", className)}
                    spellCheck
                    onFocus={() => updateAnchorPosition()}
                    style={{}}
                    {...textareaProps}
                />
            </div>

            <PopoverContent className="p-0 w-80" align="start" sideOffset={8}>
                <Command filter={(value, search) => {
                    // keep default scoring from cmdk by returning 1/0;
                    const v = value.toLowerCase();
                    const s = search.toLowerCase();
                    return v.includes(s) ? 1 : 0;
                }}>
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
                    <CommandInput
                        ref={commandInputRef as any}
                        placeholder="Digite para filtrar…"
                        value={query}
                        onValueChange={setQuery}
                    />
                    <CommandList>
                        <CommandEmpty>No results.</CommandEmpty>
                        {(childSearchGroups ?? currentGroups).map((group) => (
                            <CommandGroup key={group.groupLabel} heading={group.groupLabel}>
                                {group.items.map((it) => (
                                    <CommandItem
                                        key={it.value}
                                        value={it.label}
                                        onSelect={async () => {
                                            if (it.children) {
                                                const next = await it.children();
                                                setViewStack((s) => [...s, next]);
                                                setTimeout(() => commandInputRef.current?.focus(), 0);
                                            } else {
                                                handleSelect(it);
                                            }
                                        }}
                                    >
                                        {renderItem ? (
                                            renderItem(it)
                                        ) : (
                                            <span className="truncate">{it.label}</span>
                                        )}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        ))}
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

export type { MentionGroup, MentionGroupItem, MentionsTextareaProps };



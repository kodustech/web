"use client";

import React from "react";
import { Editor } from "@tiptap/react";

interface MCPMentionChipProps {
    app: string;
    tool: string;
    editor: Editor;
    getPos?: () => number | undefined;
}

export const MCPMentionChip: React.FC<MCPMentionChipProps> = ({ app, tool, editor, getPos }) => {
    const chipRef = React.useRef<HTMLSpanElement>(null);

    const handleRemove = React.useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            if (!getPos) {
                console.error("getPos not available");
                return;
            }

            const pos = getPos();

            if (pos === null || pos === undefined) {
                console.error("Position not found");
                return;
            }

            const { state, dispatch } = editor.view;
            const $pos = state.doc.resolve(pos);

            // For inline nodes, we need to find the exact node position
            let mentionFrom = pos;
            let mentionTo = pos;

            // Check the node at the current position
            const nodeAtPos = $pos.nodeAfter;
            if (nodeAtPos && nodeAtPos.type.name === "mcpMention") {
                mentionFrom = pos;
                mentionTo = pos + nodeAtPos.nodeSize;
            } else {
                // Try to find it in the parent nodes
                for (let depth = $pos.depth; depth >= 0; depth--) {
                    const node = $pos.node(depth);
                    if (node && node.type.name === "mcpMention") {
                        mentionFrom = $pos.before(depth);
                        mentionTo = $pos.after(depth);
                        break;
                    }
                }
            }

            if (mentionFrom !== mentionTo) {
                editor
                    .chain()
                    .focus()
                    .setTextSelection({ from: mentionFrom, to: mentionTo })
                    .deleteSelection()
                    .run();
            }
        } catch (error) {
            console.error("Error removing mention:", error);
        }
    }, [app, tool, editor, getPos]);

    return (
        <span
            ref={chipRef}
            data-type="mcp-mention"
            data-app={app}
            data-tool={tool}
            role="button"
            aria-label={`MCP tool: ${app} - ${tool}. Press Delete or Backspace to remove.`}
            tabIndex={-1}
            className="group inline-flex items-center gap-1 rounded-md bg-primary/15 px-2 py-1 ring-1 ring-primary/30 whitespace-nowrap transition-all duration-150 hover:bg-primary/20 hover:ring-primary/40"
            style={{
                display: "inline-flex",
                flexShrink: 0,
                verticalAlign: "baseline",
                lineHeight: "inherit"
            }}
            contentEditable={false}>
            <span className="text-text-secondary font-medium">mcp</span>
            <span className="text-text-secondary/70">&lt;</span>
            <span className="text-primary-light font-semibold">{app}</span>
            <span className="text-text-secondary/70">|</span>
            <span className="text-accent font-bold">{tool}</span>
            <span className="text-text-secondary/70">&gt;</span>
            <button
                type="button"
                onClick={handleRemove}
                onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }}
                aria-label="Remove"
                className="ml-1.5 -mr-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium text-text-secondary/70 hover:text-text-primary hover:bg-primary/20 opacity-0 group-hover:opacity-100 transition-all duration-150 active:scale-95">
                ×
            </button>
        </span>
    );
};


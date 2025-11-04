"use client";

import { Extension } from "@tiptap/core";

export interface SlashCommandOptions {
    onMCPTrigger?: () => void;
}

export const SlashCommand = Extension.create<SlashCommandOptions>({
    name: "slashCommand",

    addOptions() {
        return {
            onMCPTrigger: undefined,
        };
    },

    addProseMirrorPlugins() {
        return [];
    },

    addKeyboardShortcuts() {
        return {
            Backspace: ({ editor }) => {
                const { selection } = editor.state;
                const { $from } = selection;
                const textBefore = editor.state.doc.textBetween(Math.max(0, $from.pos - 5), $from.pos);

                if (textBefore === "/mcp") {
                    this.options.onMCPTrigger?.();
                    editor.commands.deleteRange({
                        from: $from.pos - 4,
                        to: $from.pos,
                    });
                    return true;
                }

                return false;
            },
        };
    },
});


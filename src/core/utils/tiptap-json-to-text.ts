/**
 * Backend utility: Converts Tiptap JSON content to plain text string.
 *
 * This is a pure TypeScript/JavaScript function with NO dependencies.
 * Can be copied to your backend codebase.
 *
 * Preserves MCP mentions as @mcp<app|tool> tokens in the output.
 *
 * @param content - Tiptap JSON object or JSON string, or plain string
 * @returns Plain text string with mentions converted to tokens
 *
 * @example
 * // Input: Tiptap JSON object or JSON string
 * const tiptapJson = {
 *   type: "doc",
 *   content: [
 *     {
 *       type: "paragraph",
 *       content: [
 *         { type: "text", text: "Hello " },
 *         { type: "mcpMention", attrs: { app: "kodus", tool: "kodus_list_commits" } },
 *         { type: "text", text: " world" }
 *       ]
 *     }
 *   ]
 * };
 *
 * // Output: "Hello @mcp<kodus|kodus_list_commits> world"
 * convertTiptapJSONToText(tiptapJson);
 */
export function convertTiptapJSONToText(
    content: string | object | null | undefined,
): string {
    // Handle null/undefined
    if (!content) return "";

    // If it's already a plain string (not JSON), return as-is
    if (typeof content === "string") {
        // Check if it's a JSON string
        if (content.startsWith("{") && content.trim().startsWith("{")) {
            try {
                const parsed = JSON.parse(content);
                return convertTiptapJSONToText(parsed);
            } catch {
                // If JSON.parse fails, it's not valid JSON, return as plain string
                return content;
            }
        }
        return content;
    }

    // If it's an object (Tiptap JSON), traverse and extract text
    if (typeof content === "object" && content !== null) {
        try {
            let text = "";

            function traverse(node: any): void {
                if (!node || typeof node !== "object") return;

                if (node.type === "text") {
                    text += node.text || "";
                } else if (node.type === "mcpMention") {
                    // Convert mention node to token format
                    const app = node.attrs?.app || "";
                    const tool = node.attrs?.tool || "";
                    text += `@mcp<${app}|${tool}>`;
                } else if (node.content && Array.isArray(node.content)) {
                    // Recursively traverse child nodes
                    node.content.forEach(traverse);
                }
            }

            traverse(content);
            return text;
        } catch {
            return "";
        }
    }

    return "";
}

/**
 * Converts Tiptap JSON content to Markdown format.
 *
 * Preserves formatting (bold, italic, headings, lists, code blocks, etc.) and MCP mentions.
 * This is useful when sending formatted content to LLMs that understand Markdown.
 *
 * @param content - Tiptap JSON object or JSON string
 * @returns Markdown string with formatting preserved
 *
 * @example
 * // Input: Tiptap JSON with bold text
 * const tiptapJson = {
 *   type: "doc",
 *   content: [
 *     {
 *       type: "paragraph",
 *       content: [
 *         { type: "text", text: "Hello ", marks: [] },
 *         { type: "text", text: "world", marks: [{ type: "bold" }] }
 *       ]
 *     }
 *   ]
 * };
 *
 * // Output: "Hello **world**"
 * convertTiptapJSONToMarkdown(tiptapJson);
 */
export function convertTiptapJSONToMarkdown(
    content: string | object | null | undefined,
): string {
    if (!content) return "";

    // Parse JSON string if needed
    if (typeof content === "string") {
        if (content.startsWith("{") && content.trim().startsWith("{")) {
            try {
                const parsed = JSON.parse(content);
                return convertTiptapJSONToMarkdown(parsed);
            } catch {
                return content;
            }
        }
        return content;
    }

    if (typeof content === "object" && content !== null) {
        try {
            let markdown = "";
            let listContext:
                | {
                      inList?: boolean;
                      listType?: "bullet" | "ordered";
                      listIndex?: number;
                  }
                | undefined;

            function traverse(node: any, context?: typeof listContext): void {
                if (!node || typeof node !== "object") return;

                const nodeType = node.type;

                // Handle text nodes with marks
                if (nodeType === "text") {
                    let text = node.text || "";

                    // Apply marks (bold, italic, code, etc.)
                    if (node.marks && Array.isArray(node.marks)) {
                        // Process marks in reverse order (innermost first)
                        const marks = [...node.marks].reverse();
                        for (const mark of marks) {
                            switch (mark.type) {
                                case "bold":
                                    text = `**${text}**`;
                                    break;
                                case "italic":
                                    text = `*${text}*`;
                                    break;
                                case "code":
                                    text = `\`${text}\``;
                                    break;
                                case "strike":
                                    text = `~~${text}~~`;
                                    break;
                                case "link":
                                    const href = mark.attrs?.href || "";
                                    text = `[${text}](${href})`;
                                    break;
                            }
                        }
                    }

                    markdown += text;
                    return;
                }

                // Handle MCP mentions
                if (nodeType === "mcpMention") {
                    const app = node.attrs?.app || "";
                    const tool = node.attrs?.tool || "";
                    markdown += `@mcp<${app}|${tool}>`;
                    return;
                }

                // Handle headings
                if (nodeType === "heading") {
                    const level = node.attrs?.level || 1;
                    const prefix = "#".repeat(level) + " ";

                    if (node.content && Array.isArray(node.content)) {
                        const beforeLength = markdown.length;
                        node.content.forEach((child: any) =>
                            traverse(child, context),
                        );

                        // Add heading prefix
                        if (markdown.length > beforeLength) {
                            const headingContent =
                                markdown.substring(beforeLength);
                            markdown =
                                markdown.substring(0, beforeLength) +
                                prefix +
                                headingContent;
                        }
                    }
                    markdown += "\n\n";
                    return;
                }

                // Handle paragraphs
                if (nodeType === "paragraph") {
                    if (node.content && Array.isArray(node.content)) {
                        const beforeLength = markdown.length;
                        node.content.forEach((child: any) =>
                            traverse(child, context),
                        );

                        // Add newline after paragraph if it's not in a list
                        if (
                            !context?.inList &&
                            markdown.length > beforeLength
                        ) {
                            markdown += "\n\n";
                        }
                    } else {
                        // Empty paragraph
                        if (!context?.inList) {
                            markdown += "\n\n";
                        }
                    }
                    return;
                }

                // Handle bullet lists
                if (nodeType === "bulletList") {
                    if (node.content && Array.isArray(node.content)) {
                        node.content.forEach((child: any) => {
                            traverse(child, {
                                ...context,
                                inList: true,
                                listType: "bullet",
                            });
                        });
                    }
                    if (!context?.inList) {
                        markdown += "\n";
                    }
                    return;
                }

                // Handle ordered lists
                if (nodeType === "orderedList") {
                    if (node.content && Array.isArray(node.content)) {
                        let index = node.attrs?.start || 1;
                        node.content.forEach((child: any) => {
                            traverse(child, {
                                ...context,
                                inList: true,
                                listType: "ordered",
                                listIndex: index,
                            });
                            index++;
                        });
                    }
                    if (!context?.inList) {
                        markdown += "\n";
                    }
                    return;
                }

                // Handle list items
                if (nodeType === "listItem") {
                    const prefix =
                        context?.listType === "ordered"
                            ? `${context.listIndex}. `
                            : "- ";

                    markdown += prefix;

                    if (node.content && Array.isArray(node.content)) {
                        const beforeLength = markdown.length;
                        node.content.forEach((child: any) =>
                            traverse(child, context),
                        );

                        // Ensure list item ends with newline
                        if (markdown.length > beforeLength) {
                            markdown += "\n";
                        }
                    }
                    return;
                }

                // Handle blockquotes
                if (nodeType === "blockquote") {
                    if (node.content && Array.isArray(node.content)) {
                        const beforeLength = markdown.length;
                        node.content.forEach((child: any) =>
                            traverse(child, context),
                        );

                        // Add > prefix to each line
                        if (markdown.length > beforeLength) {
                            const quoteContent =
                                markdown.substring(beforeLength);
                            const lines = quoteContent.split("\n");
                            const quotedLines = lines
                                .filter((l) => l.trim())
                                .map((line) => `> ${line}`)
                                .join("\n");
                            markdown =
                                markdown.substring(0, beforeLength) +
                                quotedLines;
                        }
                    }
                    markdown += "\n\n";
                    return;
                }

                // Handle code blocks
                if (nodeType === "codeBlock") {
                    const language = node.attrs?.language || "";
                    markdown += "```" + language + "\n";

                    if (node.content && Array.isArray(node.content)) {
                        node.content.forEach((child: any) => {
                            if (child.type === "text") {
                                markdown += child.text || "";
                            }
                        });
                    }

                    markdown += "\n```\n\n";
                    return;
                }

                // Handle horizontal rule
                if (nodeType === "horizontalRule") {
                    markdown += "---\n\n";
                    return;
                }

                // Handle any other node types by traversing their content
                if (node.content && Array.isArray(node.content)) {
                    node.content.forEach((child: any) =>
                        traverse(child, context),
                    );
                }
            }

            traverse(content);

            // Clean up extra newlines
            return markdown.replace(/\n{3,}/g, "\n\n").trim();
        } catch (error) {
            console.error("Error converting Tiptap JSON to Markdown:", error);
            return "";
        }
    }

    return "";
}

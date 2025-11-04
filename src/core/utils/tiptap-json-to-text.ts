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
    content: string | object | null | undefined
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


"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@components/ui/alert";
import { Badge } from "@components/ui/badge";
import { getTextStatsFromTiptapJSON } from "@components/ui/rich-text-editor";
import { getMCPConnections } from "src/lib/services/mcp-manager/fetch";

type MCPToolValidationProps = {
    value: string | object;
    className?: string;
};

export function MCPToolValidation({ value, className }: MCPToolValidationProps) {
    const [warnings, setWarnings] = React.useState<Array<{ app: string; tool: string }>>([]);
    const [isValidating, setIsValidating] = React.useState(false);

    React.useEffect(() => {
        let mounted = true;
        setIsValidating(true);

        const validateMCPTools = async () => {
            if (!value || typeof value !== "object") {
                if (mounted) {
                    setWarnings([]);
                    setIsValidating(false);
                }
                return;
            }

            const stats = getTextStatsFromTiptapJSON(value);
            if (stats.mentions === 0) {
                if (mounted) {
                    setWarnings([]);
                    setIsValidating(false);
                }
                return;
            }

            try {
                const connections = await getMCPConnections();
                const availableTools = new Set<string>();

                connections.items.forEach((conn) => {
                    const app = conn.appName.toLowerCase().replace(/\bmcp\b/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
                    conn.allowedTools.forEach((tool) => {
                        const toolKey = `${app}|${tool.toLowerCase()}`;
                        availableTools.add(toolKey);
                    });
                });

                const invalidTools: Array<{ app: string; tool: string }> = [];

                function traverse(node: any) {
                    if (node.type === "mcpMention") {
                        const app = node.attrs?.app || "";
                        const tool = node.attrs?.tool || "";
                        const toolKey = `${app}|${tool}`;
                        if (!availableTools.has(toolKey)) {
                            invalidTools.push({ app, tool });
                        }
                    }
                    if (node.content && Array.isArray(node.content)) {
                        node.content.forEach(traverse);
                    }
                }

                traverse(value);

                if (mounted) {
                    setWarnings(invalidTools);
                    setIsValidating(false);
                }
            } catch (error) {
                console.error("Error validating MCP tools:", error);
                if (mounted) {
                    setIsValidating(false);
                }
            }
        };

        const timeoutId = setTimeout(validateMCPTools, 500);

        return () => {
            mounted = false;
            clearTimeout(timeoutId);
        };
    }, [value]);

    if (warnings.length === 0) return null;

    return (
        <Alert variant="warning" className={className}>
            <AlertTriangle className="size-4" />
            <AlertDescription className="flex flex-col gap-2">
                <span className="font-medium">Some MCP tools may not be available:</span>
                <div className="flex flex-wrap gap-1.5">
                    {warnings.map((w, idx) => (
                        <Badge key={idx} variant="secondary" className="font-mono text-xs">
                            @mcp&lt;{w.app}|{w.tool}&gt;
                        </Badge>
                    ))}
                </div>
            </AlertDescription>
        </Alert>
    );
}


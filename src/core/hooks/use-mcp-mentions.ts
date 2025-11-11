"use client";

import { useEffect, useMemo, useState } from "react";
import type { MentionGroup } from "@components/ui/rich-text-editor-with-mentions";
import { getMCPConnections } from "src/lib/services/mcp-manager/fetch";

export function useMCPMentions() {
    const [mcpGroups, setMcpGroups] = useState<MentionGroup[]>([]);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const res = await getMCPConnections();
                const groups: MentionGroup[] = [
                    {
                        groupLabel: "MCP",
                        items: (res.items ?? []).map((c) => ({
                            type: "mcp" as const,
                            value: c.integrationId,
                            label: c.appName,
                            children: () => [
                                {
                                    groupLabel: c.appName,
                                    items: (c.allowedTools ?? []).map(
                                        (tool) => ({
                                            type: "mcp" as const,
                                            value: `${c.integrationId}:${tool}`,
                                            label: tool,
                                            meta: { appName: c.appName },
                                        }),
                                    ),
                                },
                            ],
                        })),
                    },
                ];

                if (mounted) {
                    setMcpGroups(groups);
                }
            } catch (error) {
                console.error("Failed to fetch MCP connections:", error);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    const formatInsertByType = useMemo(
        () => ({
            mcp: (i: any) => {
                const rawApp = String(i?.meta?.appName ?? "");
                const app = rawApp
                    .toLowerCase()
                    .replace(/\bmcp\b/g, "")
                    .replace(/[^a-z0-9]+/g, "_")
                    .replace(/^_+|_+$/g, "");
                const tool = String(i.label).toLowerCase();
                return `@mcp<${app}|${tool}> `;
            },
        }),
        [],
    );

    return {
        mcpGroups,
        formatInsertByType,
    };
}

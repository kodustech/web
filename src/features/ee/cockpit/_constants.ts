export type TabValue = keyof typeof tabs;

export const tabs = {
    "flow-metrics": "Flow metrics",
    "productivity": "Productivity",
    "code-health": "Code health",
} satisfies Record<string, string>;

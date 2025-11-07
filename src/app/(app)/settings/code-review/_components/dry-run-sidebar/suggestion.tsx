import { Badge } from "@components/ui/badge";
import { Markdown } from "@components/ui/markdown";
import { IDryRunMessage } from "@services/dryRun/types";
import { Bug, File, Info, Shield } from "lucide-react";

import { CodeDiff } from "./code";

export const SuggestionCard = ({
    suggestion,
}: {
    suggestion: IDryRunMessage;
}) => {
    const categoryIcon = {
        bug: <Bug className="h-4 w-4" />,
        security: <Shield className="h-4 w-4" />,
    };

    const getCategoryIcon = (category?: string) => {
        const icon = categoryIcon[category as keyof typeof categoryIcon];
        return icon ? icon : <Info className="h-4 w-4" />;
    };

    return (
        <div className="border-card-lv2 bg-card-lv1 overflow-hidden rounded-lg border">
            {suggestion.category && suggestion.severity && (
                <div className="flex flex-wrap items-center gap-3 p-3 px-4">
                    {getCategoryIcon(suggestion.category)}
                    <span className="font-medium">{suggestion.category}</span>
                    <Badge>{suggestion.severity}</Badge>
                </div>
            )}

            <div className="border-card-lv2 space-y-4 border-y p-4">
                <Markdown>
                    {suggestion.content.replace(
                        /<\/details>\s*<\/details>/g,
                        "</details>",
                    )}
                </Markdown>
            </div>

            {suggestion.path && (
                <div className="bg-card-lv2/50 p-4">
                    <div className="text-text-tertiary mb-2 flex items-center gap-2 text-sm">
                        <File className="h-4 w-4" />
                        <span>{suggestion.path}</span>
                        <span className="text-text-tertiary/50">
                            (lines {suggestion.lines?.start} to{" "}
                            {suggestion.lines?.end})
                        </span>
                    </div>

                    <CodeDiff codeBlock={suggestion.codeBlock} />
                </div>
            )}
        </div>
    );
};

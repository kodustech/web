import { IssueSeverityLevelBadge } from "@components/system/issue-severity-level-badge";
import { SuggestionCategoryBadge } from "@components/system/suggestion-category-badge";
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
    return (
        <div className="border-card-lv2 bg-card-lv1 overflow-hidden rounded-lg border">
            <div className="flex flex-wrap items-center gap-3 p-3 px-4">
                {suggestion.category && (
                    <SuggestionCategoryBadge category={suggestion.category} />
                )}
                {suggestion.severity && (
                    <IssueSeverityLevelBadge
                        severity={suggestion.severity as any}
                    />
                )}
            </div>

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

                    <CodeDiff
                        existingCode={suggestion.existingCode}
                        improvedCode={suggestion.improvedCode}
                        language={suggestion.language}
                    />
                </div>
            )}
        </div>
    );
};

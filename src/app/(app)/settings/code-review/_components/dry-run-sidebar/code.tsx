import React from "react";
import { SyntaxHighlight } from "@components/ui/syntax-highlight";

export const CodeDiff = ({
    existingCode,
    improvedCode,
    language,
}: {
    existingCode?: string;
    improvedCode?: string;
    language?: string;
}) => {
    if (!existingCode && !improvedCode) {
        return (
            <div className="text-text-tertiary italic">
                No code snippet available.
            </div>
        );
    }

    return (
        <pre className="overflow-x-auto rounded-md bg-black/50 p-4 font-mono text-sm">
            <code>
                <div className="space-y-3">
                    <div>
                        <p className="text-text-secondary mb-2 text-xs font-semibold">
                            Existing Code:
                        </p>
                        <SyntaxHighlight
                            language={language as any}
                            className="text-xs">
                            {existingCode}
                        </SyntaxHighlight>
                    </div>

                    <div>
                        <p className="text-text-secondary mb-2 text-xs font-semibold">
                            Improved Code:
                        </p>
                        <SyntaxHighlight
                            language={language as any}
                            className="text-xs">
                            {improvedCode}
                        </SyntaxHighlight>
                    </div>
                </div>
            </code>
        </pre>
    );
};

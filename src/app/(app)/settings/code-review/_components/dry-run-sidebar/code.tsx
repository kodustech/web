import React from "react";
import { SyntaxHighlight } from "@components/ui/syntax-highlight";

export const CodeDiff = ({ codeBlock }: { codeBlock?: string }) => {
    if (!codeBlock) {
        return (
            <div className="text-text-tertiary italic">
                No code snippet available.
            </div>
        );
    }

    const clean = codeBlock.startsWith("```")
        ? codeBlock.replace(/^```[a-zA-Z]*\n/, "").replace(/```$/, "")
        : codeBlock;
    const lines = clean.split("\n");

    return (
        <pre className="overflow-x-auto rounded-md bg-black/50 p-4 font-mono text-sm">
            <code>
                {lines.map((line, index) => {
                    // <div className="space-y-3">
                    //     <div>
                    //         <p className="text-text-secondary mb-2 text-xs font-semibold">
                    //             Existing Code:
                    //         </p>
                    //         <SyntaxHighlight
                    //             language={suggestion.language}
                    //             className="text-xs">
                    //             {suggestion.existingCode}
                    //         </SyntaxHighlight>
                    //     </div>

                    //     <div>
                    //         <p className="text-text-secondary mb-2 text-xs font-semibold">
                    //             Improved Code:
                    //         </p>
                    //         <SyntaxHighlight
                    //             language={suggestion.language}
                    //             className="text-xs">
                    //             {suggestion.improvedCode}
                    //         </SyntaxHighlight>
                    //     </div>
                    // </div>;

                    return (
                        <div key={index} className="text-text-tertiary">
                            <span className="flex-1">{line}</span>
                        </div>
                    );
                })}
            </code>
        </pre>
    );
};

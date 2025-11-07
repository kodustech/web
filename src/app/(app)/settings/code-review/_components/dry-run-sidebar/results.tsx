import { Markdown } from "@components/ui/markdown";
import {
    DryRunStatus,
    IDryRunMessage,
    IFile,
    ISuggestionByPR,
} from "@services/dryRun/types";

import { SuggestionCard } from "./suggestion";
import { PreviewSummary } from "./summary";

export const Results = ({
    messages,
    files,
    prLevelSuggestions,
    description,
    status,
    isComplete,
}: {
    messages: IDryRunMessage[];
    files: IFile[];
    prLevelSuggestions: ISuggestionByPR[];
    description: string | null;
    status: DryRunStatus | null;
    isComplete: boolean;
}) => {
    const generalMessages = [];
    const reviewMessages = [];

    for (const msg of messages) {
        if (!msg.category || !msg.severity) {
            generalMessages.push(msg);
        } else {
            reviewMessages.push(msg);
        }
    }

    let suggestions = prLevelSuggestions.length;
    for (const file of files) {
        suggestions += file.suggestions.length;
    }

    return (
        <div className="space-y-6">
            <PreviewSummary
                suggestionsSent={reviewMessages.length}
                suggestionsFound={suggestions}
                filesAnalyzed={files.length}
                isComplete={isComplete}
            />
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Description</h3>
                <div className="border-border-lv2 bg-card-lv1 rounded-lg border p-4">
                    {description ? (
                        <Markdown>{description}</Markdown>
                    ) : (
                        <p className="text-text-tertiary italic">
                            No description provided.
                        </p>
                    )}
                </div>
                <h3 className="text-lg font-semibold">General Messages</h3>
                {generalMessages.length === 0 && !isComplete && (
                    <p className="text-text-tertiary text-sm">
                        Waiting for general messages...
                    </p>
                )}
                <div className="space-y-6">
                    {generalMessages.map((message) => (
                        <SuggestionCard key={message.id} suggestion={message} />
                    ))}
                </div>
            </div>
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Suggestions</h3>
                {reviewMessages.length === 0 && !isComplete && (
                    <p className="text-text-tertiary text-sm">
                        Waiting for suggestions...
                    </p>
                )}
                <div className="space-y-6">
                    {reviewMessages.map((message) => (
                        <SuggestionCard key={message.id} suggestion={message} />
                    ))}
                </div>
            </div>
        </div>
    );
};

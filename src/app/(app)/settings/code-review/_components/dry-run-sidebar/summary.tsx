import { CheckCircle2, Loader2 } from "lucide-react";

export const PreviewSummary = ({
    suggestionsFound,
    filesAnalyzed,
    isComplete,
}: {
    suggestionsFound: number;
    filesAnalyzed: number | null;
    isComplete: boolean;
}) => (
    <div className="bg-card-lv2 flex items-center gap-4 rounded-lg p-4">
        {isComplete ? (
            <CheckCircle2 className="h-8 w-8 flex-shrink-0 text-green-500" />
        ) : (
            <Loader2 className="h-8 w-8 flex-shrink-0 animate-spin text-blue-500" />
        )}

        <div>
            <h4 className="font-semibold">
                {isComplete ? "Preview Complete" : "Preview in Progress"}
            </h4>
            <p className="text-text-tertiary text-sm">
                {isComplete
                    ? "Kodus has finished analyzing the Pull Request."
                    : "Kodus is analyzing the Pull Request..."}
            </p>
        </div>
        <div className="ml-auto flex gap-6 pr-4 text-right">
            <div>
                <div className="text-2xl font-bold">{suggestionsFound}</div>
                <div className="text-text-tertiary text-sm">
                    Suggestions found
                </div>
            </div>
            <div>
                <div className="text-2xl font-bold">
                    {filesAnalyzed ?? "--"}
                </div>
                <div className="text-text-tertiary text-sm">Files analyzed</div>
            </div>
        </div>
    </div>
);

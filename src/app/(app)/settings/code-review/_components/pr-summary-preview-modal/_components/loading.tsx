import { Heading } from "@components/ui/heading";
import { Spinner } from "@components/ui/spinner";

export const PRSummaryPreviewLoading = () => {
    return (
        <div className="flex flex-col items-center justify-center gap-4 py-12">
            <Spinner />
            <div className="text-center">
                <Heading variant="h3">Generating PR Summary</Heading>
                <p className="text-text-secondary text-sm">
                    This may take a few moments...
                </p>
            </div>
        </div>
    );
};

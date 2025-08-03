import { CardHeader, CardTitle } from "@components/ui/card";

export const PRCycleTimeAnalyticsHeader = ({
    children,
}: {
    children?: React.JSX.Element;
}) => {
    return (
        <CardHeader>
            <div className="flex justify-between gap-4">
                <CardTitle className="text-sm">
                    PR Cycle Time
                    <small className="text-text-secondary ml-1">(p75)</small>
                </CardTitle>
                {children}
            </div>
        </CardHeader>
    );
};

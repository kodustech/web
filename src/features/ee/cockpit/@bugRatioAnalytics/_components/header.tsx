import { CardHeader, CardTitle } from "@components/ui/card";

export const BugRatioAnalyticsHeader = ({
    children,
}: {
    children?: React.JSX.Element;
}) => {
    return (
        <CardHeader>
            <div className="flex justify-between gap-4">
                <CardTitle className="text-sm">Bug Ratio</CardTitle>
                {children}
            </div>
        </CardHeader>
    );
};

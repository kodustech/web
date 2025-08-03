import { CardHeader, CardTitle } from "@components/ui/card";

export const DeployFrequencyAnalyticsHeader = ({
    children,
}: {
    children?: React.JSX.Element;
}) => {
    return (
        <CardHeader>
            <div className="flex justify-between gap-4">
                <CardTitle className="text-sm">Deploy Frequency</CardTitle>
                {children}
            </div>
        </CardHeader>
    );
};

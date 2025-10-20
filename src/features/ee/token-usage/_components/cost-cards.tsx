import { Card } from "@components/ui/card";

export const CostCards = ({
    totalCost,
    averageCost,
    xAccessor,
}: {
    totalCost: number;
    averageCost: number;
    xAccessor: string;
}) => (
    <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
            <div className="text-sm text-gray-500">Total Cost</div>
            <div className="text-2xl font-bold">
                ${totalCost.toLocaleString()}
            </div>
        </Card>
        <Card className="p-4">
            <div className="text-sm text-gray-500">
                Average cost per {xAccessor}
            </div>
            <div className="text-2xl font-bold">
                ${averageCost.toFixed(2).toLocaleString()}
            </div>
        </Card>
    </div>
);

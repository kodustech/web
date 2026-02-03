import { Card } from "@components/ui/card";
import { BadgeDollarSignIcon, TrendingUpIcon } from "lucide-react";

function formatCurrency(amount: number): string {
    if (amount >= 1000) {
        return `$${(amount / 1000).toFixed(2)}K`;
    }
    return `$${amount.toFixed(2)}`;
}

function getAverageLabel(xAccessor: string): string {
    switch (xAccessor) {
        case "prNumber":
            return "Avg. per PR";
        case "developer":
            return "Avg. per Developer";
        default:
            return "Avg. per Day";
    }
}

export const CostCards = ({
    totalCost,
    averageCost,
    xAccessor,
}: {
    totalCost: number;
    averageCost: number;
    xAccessor: string;
}) => (
    <Card className="overflow-hidden">
        <div className="grid grid-cols-2 divide-x divide-[var(--color-card-lv1)]">
            {/* Total Cost */}
            <div className="flex items-center gap-4 p-4">
                <div className="bg-success/10 flex size-12 shrink-0 items-center justify-center rounded-xl">
                    <BadgeDollarSignIcon className="text-success size-6" />
                </div>
                <div className="space-y-0.5">
                    <p className="text-text-secondary text-sm">Total Cost</p>
                    <p className="text-text-primary tabular-nums text-2xl font-semibold">
                        {formatCurrency(totalCost)}
                    </p>
                </div>
            </div>

            {/* Average Cost */}
            <div className="flex items-center gap-4 p-4">
                <div className="bg-secondary-dark flex size-12 shrink-0 items-center justify-center rounded-xl">
                    <TrendingUpIcon className="text-secondary-light size-6" />
                </div>
                <div className="space-y-0.5">
                    <p className="text-text-secondary text-sm">
                        {getAverageLabel(xAccessor)}
                    </p>
                    <p className="text-text-primary tabular-nums text-2xl font-semibold">
                        {formatCurrency(averageCost)}
                    </p>
                </div>
            </div>
        </div>
    </Card>
);

import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@components/ui/tooltip";
import { HelpCircleIcon } from "lucide-react";

export const SummaryCards = ({
    totalUsage,
}: {
    totalUsage: {
        input: number;
        output: number;
        total: number;
        outputReasoning: number;
    };
}) => (
    <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
            <div className="text-sm text-gray-500">Total Input</div>
            <div className="text-2xl font-bold">
                {totalUsage.input.toLocaleString()}
            </div>
        </Card>
        <Card className="p-4">
            <div className="text-sm text-gray-500">Total Output</div>
            <div className="text-2xl font-bold">
                {totalUsage.output.toLocaleString()}
            </div>
        </Card>
        <Card className="p-4">
            <div className="text-sm text-gray-500">Total Tokens</div>
            <div className="text-2xl font-bold">
                {totalUsage.total.toLocaleString()}
            </div>
        </Card>
        <Card className="p-4">
            <div className="flex items-center text-sm text-gray-500">
                Total Output (Reasoning)
                <Tooltip>
                    <TooltipContent className="text-text-primary">
                        Already included in Total Output.
                    </TooltipContent>
                    <TooltipTrigger asChild>
                        <Button variant="cancel" size="icon-xs">
                            <HelpCircleIcon />
                        </Button>
                    </TooltipTrigger>
                </Tooltip>
            </div>
            <div className="text-2xl font-bold">
                {totalUsage.outputReasoning.toLocaleString()}
            </div>
        </Card>
    </div>
);

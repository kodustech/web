import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { magicModal } from "@components/ui/magic-modal";
import { ModelPricingInfo } from "@services/usage/types";
import { CoinsIcon, PencilIcon } from "lucide-react";

import { M } from "../_lib/constants";
import { TokenPricingModal } from "./pricing.modal";

function formatModelName(model: string): string {
    return model
        .replace(/^(openai\/|anthropic\/|google\/|meta-llama\/|mistralai\/)/, "")
        .replace(/-\d{8}$/, "")
        .replace(/:free$/, "");
}

export const PricingDetails = ({
    customPricing,
    setCustomPricing,
}: {
    customPricing: Record<string, ModelPricingInfo>;
    setCustomPricing: (pricing: Record<string, ModelPricingInfo>) => void;
}) => {
    const validPricing = Object.values(customPricing).filter(
        (p) => p && p.pricing,
    );

    const hasMultipleModels = Object.entries(customPricing).length > 2;

    const avgInput = hasMultipleModels
        ? validPricing.reduce(
              (acc, p) => acc + p.pricing.prompt * M,
              0,
          ) / Object.keys(customPricing).length
        : 0;

    const avgOutput = hasMultipleModels
        ? validPricing.reduce(
              (acc, p) => acc + p.pricing.completion * M,
              0,
          ) / Object.keys(customPricing).length
        : 0;

    return (
        <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--color-card-lv1)] px-4 py-3">
                <div className="flex items-center gap-2">
                    <div className="bg-tertiary-dark flex size-7 items-center justify-center rounded-md">
                        <CoinsIcon className="text-tertiary-light size-4" />
                    </div>
                    <span className="text-text-primary text-sm font-medium">
                        Pricing per 1M tokens
                    </span>
                </div>
                <Button
                    size="icon-xs"
                    variant="helper"
                    onClick={() =>
                        magicModal.show(() => (
                            <TokenPricingModal
                                pricing={customPricing}
                                onPricingChange={setCustomPricing}
                            />
                        ))
                    }>
                    <PencilIcon className="size-3.5" />
                </Button>
            </div>

            <div className="p-4">
                {hasMultipleModels ? (
                    <div className="flex items-center justify-between">
                        <span className="text-text-secondary text-sm">
                            Average Pricing
                        </span>
                        <span className="text-text-primary tabular-nums text-sm font-medium">
                            ${avgInput.toFixed(2)}/input, ${avgOutput.toFixed(2)}/output
                        </span>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {Object.entries(customPricing).map(([model, pricingInfo]) => {
                            const isFree =
                                pricingInfo.pricing.prompt === 0 &&
                                pricingInfo.pricing.completion === 0;

                            return (
                                <div
                                    className="flex items-center justify-between"
                                    key={model}>
                                    <span className="text-text-secondary truncate text-sm">
                                        {formatModelName(model)}
                                    </span>
                                    {isFree ? (
                                        <span className="text-success text-sm font-medium">
                                            Free
                                        </span>
                                    ) : (
                                        <span className="text-text-primary tabular-nums text-sm font-medium">
                                            ${(pricingInfo.pricing.prompt * M).toFixed(2)}/in,{" "}
                                            ${(pricingInfo.pricing.completion * M).toFixed(2)}/out
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </Card>
    );
};

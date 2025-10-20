import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { magicModal } from "@components/ui/magic-modal";
import { ModelPricingInfo } from "@services/usage/types";
import { Edit } from "lucide-react";

import { M } from "../_lib/constants";
import { TokenPricingModal } from "./pricing.modal";

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
    return (
        <Card className="p-4">
            <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Pricing per 1M tokens</span>
                <span>
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
                        <Edit size={16} className="ml-2 inline-block" />
                    </Button>
                </span>
            </div>
            <div className="flex flex-col gap-1 text-sm">
                {Object.entries(customPricing).length > 2 ? (
                    <div className="flex justify-between">
                        <span>Average Pricing</span>
                        <span>
                            $
                            {(
                                validPricing.reduce(
                                    (acc, pricingInfo) =>
                                        acc + pricingInfo.pricing.prompt * M,
                                    0,
                                ) / Object.keys(customPricing).length
                            ).toFixed(2)}
                            /input, $
                            {(
                                validPricing.reduce(
                                    (acc, pricingInfo) =>
                                        acc +
                                        pricingInfo.pricing.completion * M,
                                    0,
                                ) / Object.keys(customPricing).length
                            ).toFixed(2)}
                            /output
                        </span>
                    </div>
                ) : (
                    Object.entries(customPricing).map(
                        ([model, pricingInfo]) => (
                            <div className="flex justify-between" key={model}>
                                <span>{model}</span>
                                <span>
                                    {pricingInfo.pricing.prompt > 0 ||
                                    pricingInfo.pricing.completion > 0 ? (
                                        <>
                                            ${pricingInfo.pricing.prompt * M}
                                            /input, $
                                            {pricingInfo.pricing.completion * M}
                                            /output
                                        </>
                                    ) : (
                                        "Free"
                                    )}
                                </span>
                            </div>
                        ),
                    )
                )}
            </div>
        </Card>
    );
};

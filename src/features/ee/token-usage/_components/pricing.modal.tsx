import { useEffect, useState } from "react";
import { Button } from "@components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@components/ui/dialog";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { magicModal } from "@components/ui/magic-modal";
import { ContinuousSlider } from "@components/ui/slider";
import { ModelPricingInfo } from "@services/usage/types";

const M = 1_000_000;

export const TokenPricingModal = ({
    pricing,
    onPricingChange,
}: {
    pricing: {
        main: ModelPricingInfo;
        fallback?: ModelPricingInfo;
    };
    onPricingChange: (newPricing: {
        main: ModelPricingInfo;
        fallback?: ModelPricingInfo;
    }) => void;
}) => {
    const [localPrices, setLocalPrices] = useState(pricing);

    const handleApplyChange = () => {
        if (!localPrices) return;

        onPricingChange(localPrices);
        magicModal.hide();
    };

    const handleSliderChange = (
        type: keyof ModelPricingInfo["pricing"],
        value: number,
        isFallback = false,
    ) => {
        const modelKey = isFallback ? "fallback" : "main";
        setLocalPrices((prev) => {
            if (!prev) return prev;
            const currentModel = prev[modelKey];
            if (!currentModel) return prev;

            return {
                ...prev,
                [modelKey]: {
                    ...currentModel,
                    pricing: {
                        ...currentModel.pricing,
                        [type]: value,
                    },
                },
            };
        });
    };

    if (!localPrices?.main?.pricing) {
        return null;
    }

    return (
        <Dialog open onOpenChange={() => magicModal.hide()}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Edit Model Pricing</DialogTitle>
                    <DialogDescription>
                        Adjust the cost per 1 million tokens for your models.
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[80vh] space-y-6 overflow-y-auto py-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Main</CardTitle>
                            <CardDescription>
                                Model ID: {pricing.main.id}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label>Prompt Token Price ($/1M)</Label>
                                    <div className="flex items-center gap-4">
                                        <ContinuousSlider
                                            min={0}
                                            max={50}
                                            step={0.01}
                                            value={
                                                localPrices.main.pricing
                                                    .prompt * M
                                            }
                                            onValueChange={(val) =>
                                                handleSliderChange(
                                                    "prompt",
                                                    val / M,
                                                )
                                            }
                                        />
                                        <Input
                                            type="number"
                                            className="w-24"
                                            value={(
                                                localPrices.main.pricing
                                                    .prompt * M
                                            ).toFixed(2)}
                                            onChange={(e) =>
                                                handleSliderChange(
                                                    "prompt",
                                                    parseFloat(e.target.value) /
                                                        M || 0,
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Completion Token Price ($/1M)</Label>
                                    <div className="flex items-center gap-4">
                                        <ContinuousSlider
                                            min={0}
                                            max={50}
                                            step={0.01}
                                            value={
                                                localPrices.main.pricing
                                                    .completion * M
                                            }
                                            onValueChange={(val) =>
                                                handleSliderChange(
                                                    "completion",
                                                    val / M,
                                                )
                                            }
                                        />
                                        <Input
                                            type="number"
                                            className="w-24"
                                            value={(
                                                localPrices.main.pricing
                                                    .completion * M
                                            ).toFixed(2)}
                                            onChange={(e) =>
                                                handleSliderChange(
                                                    "completion",
                                                    parseFloat(e.target.value) /
                                                        M || 0,
                                                )
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label>
                                        Internal Reasoning Token Price ($/1M)
                                    </Label>
                                    <div className="flex items-center gap-4">
                                        <ContinuousSlider
                                            min={0}
                                            max={50}
                                            step={0.01}
                                            value={
                                                localPrices.main.pricing
                                                    .internal_reasoning * M
                                            }
                                            onValueChange={(val) =>
                                                handleSliderChange(
                                                    "internal_reasoning",
                                                    val / M,
                                                )
                                            }
                                        />
                                        <Input
                                            type="number"
                                            className="w-24"
                                            value={(
                                                localPrices.main.pricing
                                                    .internal_reasoning * M
                                            ).toFixed(2)}
                                            onChange={(e) =>
                                                handleSliderChange(
                                                    "internal_reasoning",
                                                    parseFloat(e.target.value) /
                                                        M || 0,
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Fallback</CardTitle>
                            <CardDescription>
                                Model ID: {pricing.fallback?.id || "N/A"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!pricing.fallback && (
                                <p className="text-text-secondary">
                                    No fallback model configured.
                                </p>
                            )}
                            {pricing.fallback && !localPrices.fallback && (
                                <p className="text-text-secondary">
                                    Loading fallback pricing...
                                </p>
                            )}
                            {pricing.fallback && localPrices.fallback && (
                                <div className="grid gap-4">
                                    <div className="grid gap-2">
                                        <Label>Prompt Token Price ($/1M)</Label>
                                        <div className="flex items-center gap-4">
                                            <ContinuousSlider
                                                min={0}
                                                max={50}
                                                step={0.01}
                                                value={
                                                    localPrices.fallback.pricing
                                                        .prompt * M
                                                }
                                                onValueChange={(val) =>
                                                    handleSliderChange(
                                                        "prompt",
                                                        val / M,
                                                        true,
                                                    )
                                                }
                                            />
                                            <Input
                                                type="number"
                                                className="w-24"
                                                value={(
                                                    localPrices.fallback.pricing
                                                        .prompt * M
                                                ).toFixed(2)}
                                                onChange={(e) =>
                                                    handleSliderChange(
                                                        "prompt",
                                                        parseFloat(
                                                            e.target.value,
                                                        ) / M || 0,
                                                        true,
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>
                                            Completion Token Price ($/1M)
                                        </Label>
                                        <div className="flex items-center gap-4">
                                            <ContinuousSlider
                                                min={0}
                                                max={50}
                                                step={0.01}
                                                value={
                                                    localPrices.fallback.pricing
                                                        .completion * M
                                                }
                                                onValueChange={(val) =>
                                                    handleSliderChange(
                                                        "completion",
                                                        val / M,
                                                        true,
                                                    )
                                                }
                                            />
                                            <Input
                                                type="number"
                                                className="w-24"
                                                value={(
                                                    localPrices.fallback.pricing
                                                        .completion * M
                                                ).toFixed(2)}
                                                onChange={(e) =>
                                                    handleSliderChange(
                                                        "completion",
                                                        parseFloat(
                                                            e.target.value,
                                                        ) / M || 0,
                                                        true,
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>
                                            Internal Reasoning Token Price
                                            ($/1M)
                                        </Label>
                                        <div className="flex items-center gap-4">
                                            <ContinuousSlider
                                                min={0}
                                                max={50}
                                                step={0.01}
                                                value={
                                                    localPrices.fallback.pricing
                                                        .internal_reasoning * M
                                                }
                                                onValueChange={(val) =>
                                                    handleSliderChange(
                                                        "internal_reasoning",
                                                        val / M,
                                                        true,
                                                    )
                                                }
                                            />
                                            <Input
                                                type="number"
                                                className="w-24"
                                                value={(
                                                    localPrices.fallback.pricing
                                                        .internal_reasoning * M
                                                ).toFixed(2)}
                                                onChange={(e) =>
                                                    handleSliderChange(
                                                        "internal_reasoning",
                                                        parseFloat(
                                                            e.target.value,
                                                        ) / M || 0,
                                                        true,
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <DialogFooter>
                    <Button
                        size="md"
                        variant="secondary"
                        onClick={() => magicModal.hide()}>
                        Cancel
                    </Button>
                    <Button
                        size="md"
                        variant="primary"
                        onClick={handleApplyChange}>
                        Apply Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

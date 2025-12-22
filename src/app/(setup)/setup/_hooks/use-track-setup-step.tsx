"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { capturePosthogEvent } from "src/core/utils/posthog-client";

import { useSetupStep } from "./use-setup-step";

export const useTrackSetupStep = () => {
    const pathname = usePathname();
    const { currentStep, currentStepIndex, totalSteps, isErrorPage } =
        useSetupStep();
    const lastTrackedRef = useRef<string | null>(null);

    useEffect(() => {
        if (!currentStep) return;

        const trackingKey = `${currentStep.id}:${pathname}`;
        if (lastTrackedRef.current === trackingKey) return;
        lastTrackedRef.current = trackingKey;

        capturePosthogEvent({
            event: "setup_step_viewed",
            page: pathname,
            properties: {
                step_id: currentStep.id,
                step_index: currentStepIndex,
                step_total: totalSteps,
                is_error_page: isErrorPage,
            },
        });
    }, [
        currentStep,
        currentStepIndex,
        totalSteps,
        isErrorPage,
        pathname,
    ]);
};

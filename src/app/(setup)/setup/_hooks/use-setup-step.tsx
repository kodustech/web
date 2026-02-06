"use client";

import { usePathname } from "next/navigation";

import {
    getStepById,
    getStepByPath,
    getStepIndex,
    SETUP_STEPS,
} from "../_config/setup-steps";

export const useSetupStep = () => {
    const pathname = usePathname();

    const isErrorPage =
        pathname.includes("/no-repositories") ||
        pathname.includes("/organization-account-required");

    let currentStep = getStepByPath(pathname);
    let currentStepIndex = currentStep ? getStepIndex(currentStep.id) : -1;

    if (isErrorPage) {
        currentStep = getStepById("choosing-repositories");
        currentStepIndex = currentStep ? getStepIndex(currentStep.id) : -1;
    }

    const previousStep =
        currentStepIndex > 0 ? SETUP_STEPS[currentStepIndex - 1] : undefined;
    const previousStepIndex = currentStepIndex > 0 ? currentStepIndex - 1 : -1;

    const getStepStatus = (
        stepIndex: number,
    ): "active" | "completed" | "inactive" | "error" => {
        if (stepIndex < 0) return "inactive";
        if (stepIndex === currentStepIndex && !isErrorPage) return "active";
        if (stepIndex < currentStepIndex) return "completed";
        return "inactive";
    };

    return {
        currentStep,
        previousStep,
        currentStepIndex,
        previousStepIndex,
        getStepStatus,
        totalSteps: SETUP_STEPS.length,
        isErrorPage,
    };
};

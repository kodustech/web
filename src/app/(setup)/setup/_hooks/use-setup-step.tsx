"use client";

import { usePathname } from "next/navigation";

import {
    getStepByPath,
    getStepIndex,
    SETUP_STEPS,
    type SetupStepId,
} from "../_config/setup-steps";

export const useSetupStep = () => {
    const pathname = usePathname();

    const isErrorPage =
        pathname.includes("/no-repositories") ||
        pathname.includes("/organization-account-required");

    let currentStep = getStepByPath(pathname);
    let currentStepIndex = currentStep ? getStepIndex(currentStep.id) : -1;

    if (isErrorPage) {
        currentStep = SETUP_STEPS.find(
            (step) => step.id === "choosing-repositories",
        );
        currentStepIndex = currentStep ? getStepIndex(currentStep.id) : -1;
    }

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
        currentStepIndex,
        getStepStatus,
        totalSteps: SETUP_STEPS.length,
        isErrorPage,
    };
};

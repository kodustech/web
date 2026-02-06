"use client";

import { redirect } from "next/navigation";
import { getCookie } from "cookies-next/client";

import { SETUP_LAST_STEP } from "./_components/setup-step-tracker";
import { getStepByPath, SETUP_STEPS } from "./_config/setup-steps";

export default function Setup() {
    const lastStep = getCookie(SETUP_LAST_STEP) as string | undefined;
    const isValidLastStep = lastStep && getStepByPath(lastStep);

    if (isValidLastStep) {
        redirect(lastStep);
    }

    redirect(SETUP_STEPS[0].path);
}

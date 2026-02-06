"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { setCookie } from "cookies-next/client";

import { getStepByPath } from "../_config/setup-steps";

export const SETUP_LAST_STEP = "setup-last-step";

export const SetupProgressSaver = () => {
    const pathname = usePathname();

    useEffect(() => {
        const matchedStep = getStepByPath(pathname);

        if (matchedStep) {
            setCookie(SETUP_LAST_STEP, matchedStep.path, {
                expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
            });
        }
    }, [pathname]);

    return null;
};

"use client";

import { createContext, useContext } from "react";
import { PlatformConfigValue } from "@services/parameters/types";
import type { LiteralUnion } from "react-hook-form";

import type {
    AutomationCodeReviewConfigType,
    CodeReviewGlobalConfig,
} from "./pages/types";

const AutomationCodeReviewConfigContext =
    createContext<AutomationCodeReviewConfigType>(
        {} as AutomationCodeReviewConfigType,
    );

export const useAutomationCodeReviewConfig = (
    repository: LiteralUnion<"global", string>,
) => {
    const context = useContext(AutomationCodeReviewConfigContext);

    let response:
        | (CodeReviewGlobalConfig & {
              id?: string;
              name?: string;
              isSelected?: boolean;
          })
        | undefined;

    if (repository === "global") {
        response = context?.global;
    } else {
        response = context?.repositories.find((r) => r.id === repository);
    }

    return response;
};

export const AutomationCodeReviewConfigProvider = (
    props: React.PropsWithChildren & {
        config: AutomationCodeReviewConfigType;
    },
) => (
    <AutomationCodeReviewConfigContext.Provider value={props.config}>
        {props.children}
    </AutomationCodeReviewConfigContext.Provider>
);

const PlatformConfigContext = createContext<PlatformConfigValue>(
    {} as PlatformConfigValue,
);

export const usePlatformConfig = () => {
    return useContext(PlatformConfigContext);
};

export const PlatformConfigProvider = (
    props: React.PropsWithChildren & {
        config: PlatformConfigValue;
    },
) => (
    <PlatformConfigContext.Provider value={props.config}>
        {props.children}
    </PlatformConfigContext.Provider>
);

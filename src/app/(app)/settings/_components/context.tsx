"use client";

import { createContext, useContext } from "react";
import { PlatformConfigValue } from "@services/parameters/types";

import { useCodeReviewRouteParams } from "../_hooks";
import type {
    AutomationCodeReviewConfigType,
    CodeReviewRepositoryConfig,
} from "../code-review/_types";

const AutomationCodeReviewConfigContext =
    createContext<AutomationCodeReviewConfigType>(
        {} as AutomationCodeReviewConfigType,
    );

export const useCodeReviewConfig = ():
    | (CodeReviewRepositoryConfig & { displayName: string })
    | undefined => {
    const { repositoryId, directoryId } = useCodeReviewRouteParams();
    const context = useFullCodeReviewConfig();

    if (repositoryId === "global")
        return {
            ...context.global,
            id: "global",
            name: "Global",
            isSelected: true,
            displayName: "Global",
        };

    const repository = context.repositories.find((r) => r.id === repositoryId);
    if (!repository) return;

    const directory = repository?.directories?.find(
        (d) => d.id === directoryId,
    );

    if (!directory) return { ...repository, displayName: repository.name };

    return {
        ...directory,
        displayName: `${repository?.name}${directory?.path}`,
    };
};

export const useFullCodeReviewConfig = (): AutomationCodeReviewConfigType => {
    const context = useContext(AutomationCodeReviewConfigContext);

    if (!context) {
        throw new Error(
            "useAutomationCodeReviewConfig needs AutomationCodeReviewConfigContext to work",
        );
    }

    return context;
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

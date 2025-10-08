"use client";

import { createContext, useContext } from "react";
import { PlatformConfigValue } from "@services/parameters/types";
import { CustomMessageConfig } from "@services/pull-request-messages/types";

import { useCodeReviewRouteParams } from "../_hooks";
import type {
    CodeReviewGlobalConfig,
    CodeReviewRepositoryConfig,
    FormattedCodeReviewConfig,
    FormattedGlobalCodeReviewConfig,
} from "../code-review/_types";

const AutomationCodeReviewConfigContext =
    createContext<FormattedGlobalCodeReviewConfig>(
        {} as FormattedGlobalCodeReviewConfig,
    );

export const useCodeReviewConfig = ():
    | (FormattedCodeReviewConfig & {
          id: string;
          name: string;
          isSelected: boolean;
          displayName: string;
      })
    | undefined => {
    const { repositoryId, directoryId } = useCodeReviewRouteParams();
    const context = useFullCodeReviewConfig();

    if (repositoryId === "global") {
        const { configs } = context;

        return {
            ...configs,
            id: "global",
            name: "Global",
            isSelected: true,
            displayName: "Global",
        };
    }

    const repository = context.repositories.find((r) => r.id === repositoryId);
    if (!repository) return;

    const directory = repository?.directories?.find(
        (d) => d.id === directoryId,
    );

    if (!directory) {
        const { configs, ...rest } = repository;

        return {
            ...configs,
            ...rest,
            displayName: repository.name,
        };
    }

    const { configs, ...rest } = repository;

    return {
        ...configs,
        ...rest,
        displayName: `${repository?.name}${directory?.path}`,
    };
};

export const useFullCodeReviewConfig = (): FormattedGlobalCodeReviewConfig => {
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
        config: FormattedGlobalCodeReviewConfig;
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

const DefaultCodeReviewConfigContext = createContext<
    CodeReviewGlobalConfig &
        Omit<CustomMessageConfig, "uuid" | "repositoryId" | "directoryId">
>(
    {} as CodeReviewGlobalConfig &
        Omit<CustomMessageConfig, "uuid" | "repositoryId" | "directoryId">,
);

export const useDefaultCodeReviewConfig = () => {
    return useContext(DefaultCodeReviewConfigContext);
};

export const DefaultCodeReviewConfigProvider = (
    props: React.PropsWithChildren & {
        config: CodeReviewGlobalConfig &
            Omit<CustomMessageConfig, "uuid" | "repositoryId" | "directoryId">;
    },
) => (
    <DefaultCodeReviewConfigContext.Provider value={props.config}>
        {props.children}
    </DefaultCodeReviewConfigContext.Provider>
);

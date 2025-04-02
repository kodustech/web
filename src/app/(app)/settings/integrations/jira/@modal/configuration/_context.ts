import { createContext } from "react";
import type { IntegrationsCommon } from "src/core/types";

export const JiraSetupContext = createContext<{
    isSaving: boolean;
    domain: {
        selected: IntegrationsCommon | undefined;
        setSelected: (domain: IntegrationsCommon | undefined) => void;
    };
    project: {
        selected: IntegrationsCommon | undefined;
        setSelected: (project: IntegrationsCommon | undefined) => void;
    };
    board: {
        selected: IntegrationsCommon | undefined;
        setSelected: (board: IntegrationsCommon | undefined) => void;
    };
}>({} as any);

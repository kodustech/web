import { type AutomationType } from "@enums";

export type TeamAutomation = {
    uuid: string;
    status: boolean;
    automation: {
        name: string;
        description: string;
        status: boolean;
        automationType: AutomationType;
    };
};

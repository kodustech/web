export const SETUP_STEPS = [
    {
        id: "choose-workspace",
        path: "/setup/choose-workspace",
    },
    {
        id: "creating-workspace",
        path: "/setup/creating-workspace",
    },
    {
        id: "connecting-git-tool",
        path: "/setup/connecting-git-tool",
    },
    {
        id: "choosing-repositories",
        path: "/setup/choosing-repositories",
    },
    {
        id: "byok-setup",
        path: "/setup/byok-setup",
    },
    {
        id: "customize-team",
        path: "/setup/customize-team",
    },
    {
        id: "choosing-a-pull-request",
        path: "/setup/choosing-a-pull-request",
    },
] as const;

export type SetupStepId = (typeof SETUP_STEPS)[number]["id"];

export const getStepIndex = (stepId: SetupStepId): number => {
    return SETUP_STEPS.findIndex((step) => step.id === stepId);
};

export const getStepById = (stepId: SetupStepId) => {
    return SETUP_STEPS.find((step) => step.id === stepId);
};

export const getStepByPath = (pathname: string) => {
    return SETUP_STEPS.find((step) => pathname.startsWith(step.path));
};

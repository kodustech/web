import { redirect } from "next/navigation";

import { useIsSetupComplete } from "./use-is-setup-complete";

export const useSetupLock = () => {
    const isSetupComplete = useIsSetupComplete();
    if (!isSetupComplete) redirect("/setup");
};

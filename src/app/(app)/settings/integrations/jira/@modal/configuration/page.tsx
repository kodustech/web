"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@components/ui/dialog";
import { MultiStep } from "@components/ui/multi-step";
import { useAsyncAction } from "@hooks/use-async-action";
import { saveProjectManagementConfigs } from "@services/projectManagement/fetch";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";
import { IntegrationsCommon } from "src/core/types";

import { JiraSetupContext } from "./_context";
import { steps } from "./_steps";

export default function JiraConfigurationPage() {
    const router = useRouter();
    const { teamId } = useSelectedTeamId();

    const [domainSelected, setDomainSelected] = useState<
        IntegrationsCommon | undefined
    >();

    const [projectSelected, setProjectSelected] = useState<
        IntegrationsCommon | undefined
    >();

    const [boardSelected, setBoardSelected] = useState<
        IntegrationsCommon | undefined
    >();

    const [saveSelectedInfos, { loading: isSaving }] = useAsyncAction(
        async () => {
            await saveProjectManagementConfigs(
                {
                    domainSelected,
                    projectSelected,
                    boardSelected,
                },
                teamId,
            );

            router.replace("configuration/select-columns");
        },
    );

    return (
        <Dialog open onOpenChange={() => router.push(`/settings/integrations`)}>
            <DialogContent>
                <JiraSetupContext
                    value={{
                        isSaving,
                        domain: {
                            selected: domainSelected,
                            setSelected: setDomainSelected,
                        },
                        project: {
                            selected: projectSelected,
                            setSelected: setProjectSelected,
                        },
                        board: {
                            selected: boardSelected,
                            setSelected: setBoardSelected,
                        },
                    }}>
                    <MultiStep
                        steps={steps}
                        initialStep="domain"
                        onFinish={() => {
                            saveSelectedInfos();
                        }}
                    />
                </JiraSetupContext>
            </DialogContent>
        </Dialog>
    );
}

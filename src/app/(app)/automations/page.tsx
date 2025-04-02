import { Page } from "@components/ui/page";
import { getAutomationsByTeamId } from "@services/automations/fetch";
import { getGlobalSelectedTeamId } from "src/core/utils/get-global-selected-team-id";

import AutomationCard from "./_components/AutomationCard";

export default async function Automations() {
    const automations = await getAutomationsByTeamId(await getGlobalSelectedTeamId());

    return (
        <Page.Root>
            <Page.Header>
                <Page.Title>Automations</Page.Title>
            </Page.Header>

            <Page.Content>
                {(!automations || automations?.length === 0) ? (
                    <p className="text-center">No automations were found.</p>) : (
                    <div className="grid grid-cols-3 flex-col gap-4">
                        {automations?.map((automation) => (
                            <AutomationCard key={automation.uuid} teamAutomation={automation} />
                        ))}
                    </div>
                )}
            </Page.Content>
        </Page.Root>
    );
}

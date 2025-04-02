import CardsGroup from "@components/system/cardsGroup";
import { Alert, AlertDescription, AlertTitle } from "@components/ui/alert";
import { Page } from "@components/ui/page";
import { getConnections } from "@services/setup/fetch";
import { getTeams } from "@services/teams/fetch";
import { HelpCircleIcon } from "lucide-react";
import { getGlobalSelectedTeamId } from "src/core/utils/get-global-selected-team-id";

export default async function IntegrationsPage() {
    const [teamId, teams] = await Promise.all([
        getGlobalSelectedTeamId(),
        getTeams(),
    ]);

    const connections = await getConnections(teamId);
    const team = teams.find((team) => team.uuid === teamId)!;

    return (
        <Page.Root>
            <Page.Header>
                <Page.Title>Integrations</Page.Title>
            </Page.Header>

            <Page.Content>
                <CardsGroup connections={connections} team={team} />

                <Alert>
                    <HelpCircleIcon className="h-5 w-5" />

                    <AlertTitle>
                        Connect tools so Kody can assist you!
                    </AlertTitle>

                    <AlertDescription className="mt-6 flex flex-col gap-2">
                        <span>
                            By connecting at least one tool, you'll gain access
                            to automations, receive accurate responses, and get
                            personalized solutions.
                        </span>
                        <span>
                            We also recommend connecting a communication tool.
                            It will enable you to:
                            <li>
                                Interact directly with Kody from your favorite
                                tool;
                            </li>
                            <li>
                                Activate automations, like check-ins and flow
                                alerts, directly within the connected platform.
                            </li>
                        </span>
                    </AlertDescription>
                </Alert>
            </Page.Content>
        </Page.Root>
    );
}

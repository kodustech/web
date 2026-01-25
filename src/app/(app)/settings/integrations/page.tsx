import CardsGroup from "@components/system/cardsGroup";
import { Alert, AlertDescription, AlertTitle } from "@components/ui/alert";
import { Page } from "@components/ui/page";
import { getConnections } from "@services/setup/fetch";
import { getTeams } from "@services/teams/fetch";
import { HelpCircleIcon } from "lucide-react";
import { ErrorCard } from "src/core/components/ui/error-card";
import { getGlobalSelectedTeamId } from "src/core/utils/get-global-selected-team-id";
import { safeArray } from "src/core/utils/safe-array";

export default async function IntegrationsPage() {
    const [teamId, teams] = await Promise.all([
        getGlobalSelectedTeamId(),
        getTeams(),
    ]);

    let connectionsError = false;
    const connectionsResult = await getConnections(teamId).catch(() => {
        connectionsError = true;
        return [];
    });
    const connections = safeArray(connectionsResult);
    const team = teams.find((team) => team.uuid === teamId)!;

    return (
        <Page.Root>
            <Page.Header>
                <Page.Title>Integrations</Page.Title>
            </Page.Header>

            <Page.Content>
                {connectionsError ? (
                    <ErrorCard
                        variant="card"
                        message="Failed to load integrations. Please try again."
                    />
                ) : (
                    <CardsGroup connections={connections} team={team} />
                )}

                <Alert>
                    <HelpCircleIcon />

                    <AlertTitle>
                        Connect tools so Kody can assist you!
                    </AlertTitle>

                    <AlertDescription>
                        <span>
                            By connecting at least one tool, you'll gain access
                            to automations, receive accurate responses, and get
                            personalized solutions.
                        </span>
                        <span>
                            We also recommend connecting a communication tool.
                            It will enable you to:
                            <li className="mt-4">
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

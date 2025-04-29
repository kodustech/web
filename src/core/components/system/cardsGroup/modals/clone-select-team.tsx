import { useState } from "react";
import { Button } from "@components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@components/ui/dialog";
import { magicModal } from "@components/ui/magic-modal";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@components/ui/select";
import { INTEGRATIONS_TYPES } from "@enums";
import { useAsyncAction } from "@hooks/use-async-action";
import type { TeamWithIntegrations } from "@services/teams/types";
import { Copy } from "lucide-react";

type Props = {
    teams: TeamWithIntegrations[];
    category: INTEGRATIONS_TYPES;
    onCloneIntegration: (teamIdToClone: string) => Promise<void>;
};

export const CloneSelectTeamModal = ({
    teams,
    category,
    onCloneIntegration,
}: Props) => {
    const [selectedTeamIdToClone, setSelectedTeamIdToClone] =
        useState<string>();

    const filteredTeams = teams.filter((team) => {
        switch (category) {
            case INTEGRATIONS_TYPES.CODE_MANAGEMENT:
                return team.hasCodeManagement;
            case INTEGRATIONS_TYPES.PROJECT_MANAGEMENT:
                return team.hasProjectManagement;
            case INTEGRATIONS_TYPES.COMMUNICATION:
                return team.hasCommunication;
            default:
                return false;
        }
    });

    const [cloneThisIntegration, { loading }] = useAsyncAction(async () => {
        await onCloneIntegration(selectedTeamIdToClone!);
        magicModal.hide(true);
    });

    if (filteredTeams.length === 0) {
        return null;
    }

    return (
        <Dialog open onOpenChange={() => magicModal.hide()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Which team would you like to clone?
                    </DialogTitle>
                </DialogHeader>

                <div className="text-text-secondary flex flex-col gap-2 text-sm">
                    <Select
                        value={selectedTeamIdToClone}
                        disabled={loading}
                        onValueChange={setSelectedTeamIdToClone}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a team to clone" />
                        </SelectTrigger>

                        <SelectContent>
                            {filteredTeams.map((team) => (
                                <SelectItem key={team.uuid} value={team.uuid}>
                                    {team.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <DialogFooter>
                    <Button
                        size="md"
                        variant="primary"
                        leftIcon={<Copy />}
                        disabled={!selectedTeamIdToClone}
                        loading={loading}
                        onClick={cloneThisIntegration}>
                        Clone Integration
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

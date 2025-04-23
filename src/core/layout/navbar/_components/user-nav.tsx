"use client";

import { useRouter } from "next/navigation";
import { toast } from "@components/ui/toaster/use-toast";
import { useSuspenseGetOrganizationId } from "@services/setup/hooks";
import { LogOutIcon, SettingsIcon, UserIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "src/core/components/ui/avatar";
import { Button } from "src/core/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "src/core/components/ui/dropdown-menu";
import { useAllTeams } from "src/core/providers/all-teams-context";
import { useAuth } from "src/core/providers/auth.provider";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";
import { TEAM_STATUS } from "src/core/types";

export function UserNav() {
    const { email, isOwner } = useAuth();
    const { teams } = useAllTeams();
    const { teamId, setTeamId } = useSelectedTeamId();

    const router = useRouter();
    const organizationId = useSuspenseGetOrganizationId();

    const handleChangeWorkspace = (teamId: string) => {
        setTeamId(teamId);

        const team = teams.find((team) => team.uuid === teamId);

        toast({
            variant: "info",
            description: (
                <span>
                    Workspace changed to{" "}
                    <span className="text-primary-light font-bold">
                        {team?.name}
                    </span>
                </span>
            ),
        });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    size="icon-md"
                    variant="cancel"
                    className="rounded-full">
                    <Avatar className="size-full">
                        {/* TODO: call user's avatar */}
                        {/* <AvatarImage src="" alt="username" /> */}
                        {/* TODO: call user's name and get initials */}
                        <AvatarFallback>
                            <UserIcon />
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-60" align="end">
                <DropdownMenuLabel className="text-text-primary text-sm font-normal">
                    {email}
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuLabel>Workspaces</DropdownMenuLabel>

                <DropdownMenuRadioGroup
                    value={teamId}
                    onValueChange={handleChangeWorkspace}>
                    {teams.map((team) => (
                        <DropdownMenuRadioItem
                            key={team.uuid}
                            value={team.uuid}
                            disabled={team.status !== TEAM_STATUS.ACTIVE}>
                            {team.name}
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>

                <DropdownMenuSeparator />

                {isOwner && (
                    <DropdownMenuItem
                        onClick={() => router.push(`/organization/general`)}>
                        <SettingsIcon />
                        Settings
                    </DropdownMenuItem>
                )}

                <DropdownMenuItem onClick={() => router.replace(`/sign-out`)}>
                    <LogOutIcon />
                    Sign out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

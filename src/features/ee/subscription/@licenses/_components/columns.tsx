"use client";

import { magicModal } from "@components/ui/magic-modal";
import { Switch } from "@components/ui/switch";
import { useAsyncAction } from "@hooks/use-async-action";
import { useSuspenseGetConnections } from "@services/setup/hooks";
import { ColumnDef } from "@tanstack/react-table";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";
import { useSubscriptionStatus } from "src/features/ee/subscription/_hooks/use-subscription-status";

import { assignOrDeassignUserLicenseAction } from "../../_actions/assign-or-deassign-license";
import { NoMoreLicensesModal } from "./no-more-licenses-modal";

type Type = {
    id: number;
    name: string;
    licenseStatus: "active" | "inactive";
};

export const columns: ColumnDef<Type>[] = [
    {
        accessorKey: "name",
        header: "Username",
        size: 150,
    },
    {
        header: "License assignment",
        cell: ({ row, table }) => {
            const subscription = useSubscriptionStatus();
            const { teamId } = useSelectedTeamId();
            const connections = useSuspenseGetConnections(teamId);

            const codeManagementConnection = connections.find(
                (connection) => connection.category === "CODE_MANAGEMENT",
            );

            const [
                assignOrDeassignLicense,
                { loading: isAssigningOrDeassigningLicense },
            ] = useAsyncAction(async (licenseStatus: Type["licenseStatus"]) => {
                await assignOrDeassignUserLicenseAction({
                    teamId,
                    user: {
                        git_id: row.original.id.toString(),
                        git_tool:
                            codeManagementConnection?.platformName.toLowerCase()!,
                        licenseStatus,
                    },
                    userName: row.original.name,
                });
            });

            // const number = table.options.data.filter((item) => item.licenseStatus === "active").length;

            return (
                <Switch
                    loading={isAssigningOrDeassigningLicense}
                    checked={row.original.licenseStatus === "active"}
                    disabled={subscription.status !== "active"}
                    onCheckedChange={async () => {
                        if (
                            subscription.status === "active" &&
                            subscription.usersWithAssignedLicense.length >=
                                subscription.numberOfLicenses &&
                            row.original.licenseStatus === "inactive"
                        ) {
                            magicModal.show(() => (
                                <NoMoreLicensesModal teamId={teamId} />
                            ));
                            return;
                        }

                        assignOrDeassignLicense(
                            row.original.licenseStatus === "active"
                                ? "inactive"
                                : "active",
                        );
                    }}
                />
            );
        },
    },
];

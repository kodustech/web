"use server";

import { revalidatePath } from "next/cache";

import { assignOrDeassignUserLicense } from "../_services/billing/fetch";

export const assignOrDeassignUserLicenseAction = async ({
    teamId,
    user,
}: {
    teamId: string;
    user: {
        git_id: string;
        git_tool: string;
        licenseStatus: "active" | "inactive";
    };
}) => {
    const { error, successful } = await assignOrDeassignUserLicense({
        teamId,
        user: {
            gitId: user.git_id,
            gitTool: user.git_tool,
            licenseStatus: user.licenseStatus,
        },
    });

    revalidatePath("/settings/subscription");

    return { error, successful };
};

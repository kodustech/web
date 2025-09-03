"use server";

import { revalidatePath } from "next/cache";
import { auth } from "src/core/config/auth";

import { assignOrDeassignUserLicense } from "../_services/billing/fetch";

export const assignOrDeassignUserLicenseAction = async ({
    teamId,
    user,
    userName,
}: {
    teamId: string;
    user: {
        git_id: string;
        git_tool: string;
        licenseStatus: "active" | "inactive";
    };
    userName?: string;
}) => {
    const jwtPayload = await auth();

    const { error, successful } = await assignOrDeassignUserLicense({
        teamId,
        user: {
            gitId: user.git_id,
            gitTool: user.git_tool,
            licenseStatus: user.licenseStatus,
        },
        currentUser: {
            userId: jwtPayload?.user.userId,
            email: jwtPayload?.user.email,
        },
        userName,
    });

    revalidatePath("/settings/subscription");

    return { error, successful };
};

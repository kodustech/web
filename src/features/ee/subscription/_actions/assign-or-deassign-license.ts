"use server";

import { revalidatePath } from "next/cache";
import { getJwtPayload } from "src/lib/auth/utils";

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
    const jwtPayload = await getJwtPayload();
    const currentUser = {
        userId: jwtPayload?.sub,
        email: jwtPayload?.email,
    };

    const { error, successful } = await assignOrDeassignUserLicense({
        teamId,
        user: {
            gitId: user.git_id,
            gitTool: user.git_tool,
            licenseStatus: user.licenseStatus,
        },
        currentUser,
        userName,
    });

    revalidatePath("/settings/subscription");

    return { error, successful };
};

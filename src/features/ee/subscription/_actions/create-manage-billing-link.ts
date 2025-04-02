"use server";

import { createManageBillingLink } from "../_services/billing/fetch";

export const createManageBillingLinkAction = async ({
    teamId,
}: {
    teamId: string;
}) => {
    try {
        const { url } = await createManageBillingLink({ teamId });
        return { url };
    } catch (error) {
        console.error("Failed to create billing link:", error);
        throw new Error("Failed to create billing management link");
    }
};

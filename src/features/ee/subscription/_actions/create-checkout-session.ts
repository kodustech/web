"use server";

import { createCheckoutSession } from "../_services/billing/fetch";

export const createCheckoutSessionAction = async ({
    teamId,
    planId,
    quantity,
}: {
    teamId: string;
    planId: string;
    quantity: number;
}) => {
    try {
        const { url } = await createCheckoutSession({
            teamId,
            quantity,
            planId,
        });
        return { url };
    } catch (error) {
        console.error("Failed to create checkout session:", error);
        throw new Error("Failed to create checkout session");
    }
};

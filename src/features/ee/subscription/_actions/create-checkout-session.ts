"use server";

import { createCheckoutSession } from "../_services/billing/fetch";

export const createCheckoutSessionAction = async ({
    teamId,
}: {
    teamId: string;
}) => {
    try {
        const { url } = await createCheckoutSession({ teamId, quantity: 1 });
        return { url };
    } catch (error) {
        console.error("Failed to create checkout session:", error);
        throw new Error("Failed to create checkout session");
    }
};

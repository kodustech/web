import { authorizedFetch } from "@services/fetch";
import { getOrganizationId } from "@services/organizations/fetch";
import { pathToApiUrl } from "src/core/utils/helpers";
import { isSelfHosted } from "src/core/utils/self-hosted";

import type { OrganizationLicense } from "./types";
import { billingFetch } from "./utils";

export const getPullRequestAuthors = async () => {
    return authorizedFetch<
        Array<{ id: number; name: string; contributions: number }>
    >(pathToApiUrl("/pull-requests/get-pull-request-authors"));
};

export const startTeamTrial = async (params: {
    teamId: string;
    organizationId: string;
}) => {
    return billingFetch<{
        id: string;
        organizationId: string;
        teamId: string;
        subscriptionStatus: "trial";
        cloudToken: string;
        trialEnd: Date;
        stripeCustomerId: null;
        stripeSubscriptionId: null;
        totalLicenses: number;
        assignedLicenses: number;
        createdAt: Date;
        updatedAt: Date;
    }>(`/trial`, {
        method: "POST",
        body: JSON.stringify({
            organizationId: params.organizationId,
            teamId: params.teamId,
        }),
    });
};

export const createCheckoutSession = async (params: {
    teamId: string;
    quantity: number;
}) => {
    const organizationId = await getOrganizationId();

    return billingFetch<{ url: string }>(`/create-checkout-session`, {
        method: "POST",
        body: JSON.stringify({
            organizationId,
            teamId: params.teamId,
            quantity: params.quantity,
        }),
    });
};

export const createManageBillingLink = async (params: { teamId: string }) => {
    const organizationId = await getOrganizationId();

    return billingFetch<{ url: string }>(
        `/portal/${organizationId}/${params.teamId}`,
        { method: "GET" },
    );
};

export const getUsersWithLicense = async (params: { teamId: string }) => {
    if (isSelfHosted) return [];

    const organizationId = await getOrganizationId();
    return billingFetch<Array<{ git_id: string }>>(`/users-with-license`, {
        params: { organizationId, teamId: params.teamId },
    });
};

export const assignOrDeassignUserLicense = async (params: {
    teamId: string;
    user: {
        gitId: string;
        gitTool: string;
        licenseStatus: "active" | "inactive";
    };
    currentUser?: {
        userId?: string;
        email?: string;
    };
    userName?: string;
}) => {
    const organizationId = await getOrganizationId();

    return billingFetch<{
        successful: any[];
        error: any[];
    }>(`/assign-license`, {
        method: "POST",
        body: JSON.stringify({
            organizationId,
            teamId: params.teamId,
            users: [params.user],
            editedBy: params.currentUser,
            userName: params.userName,
        }),
    });
};

export const validateOrganizationLicense = async (params: {
    teamId: string;
}): Promise<OrganizationLicense> => {
    if (isSelfHosted) {
        return { valid: true, subscriptionStatus: "self-hosted" };
    }

    const organizationId = await getOrganizationId();
    return billingFetch(`/validate-org-license`, {
        method: "GET",
        params: { organizationId, teamId: params.teamId },
    });
};

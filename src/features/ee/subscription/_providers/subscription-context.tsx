"use client";

import { createContext, useContext } from "react";
import { isSelfHosted } from "src/core/utils/self-hosted";

import type {
    getUsersWithLicense,
    validateOrganizationLicense,
} from "../_services/billing/fetch";

type License = {
    license: Awaited<ReturnType<typeof validateOrganizationLicense>>;
};
type UsersWithAssignedLicense = {
    usersWithAssignedLicense: Awaited<ReturnType<typeof getUsersWithLicense>>;
};

const SubscriptionContext = createContext<License & UsersWithAssignedLicense>({
    usersWithAssignedLicense: [],
    license: {
        valid: true,
        subscriptionStatus: "self-hosted",
    },
});

export const useSubscriptionContext = () => {
    const context = useContext(SubscriptionContext);
    return context;
};

export const SubscriptionProvider = ({
    children,
    license,
    usersWithAssignedLicense,
}: React.PropsWithChildren & {
    license: Awaited<ReturnType<typeof validateOrganizationLicense>>;
    usersWithAssignedLicense: Awaited<ReturnType<typeof getUsersWithLicense>>;
}) => {
    if (isSelfHosted) { return children };

    return (
        <SubscriptionContext.Provider
            value={{ license, usersWithAssignedLicense }}>
            {children}
        </SubscriptionContext.Provider>
    );
};

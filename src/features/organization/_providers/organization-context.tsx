"use client";

import { createContext, useContext } from "react";

const OrganizationContext = createContext<{
    organizationId: string;
    organizationName: string;
}>({
    organizationId: "",
    organizationName: "",
});

export const useOrganizationContext = () => {
    const context = useContext(OrganizationContext);
    return context;
};

export const OrganizationProvider = ({
    children,
    organization,
}: React.PropsWithChildren & {
    organization: { id: string; name: string };
}) => {
    return (
        <OrganizationContext.Provider
            value={{
                organizationId: organization.id,
                organizationName: organization.name,
            }}>
            {children}
        </OrganizationContext.Provider>
    );
};

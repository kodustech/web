"use client";

import { createContext, useContext } from "react";
import { PermissionsMap } from "@services/permissions/types";

const permissionsContext = createContext<PermissionsMap>({});

export const PermissionsProvider = ({
    children,
    permissions = {},
}: React.PropsWithChildren & {
    permissions?: PermissionsMap;
}) => {
    return (
        <permissionsContext.Provider value={permissions}>
            {children}
        </permissionsContext.Provider>
    );
};

export const usePermissions = () => {
    const permissions = useContext(permissionsContext);
    return permissions;
};

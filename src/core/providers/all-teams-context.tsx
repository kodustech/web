"use client";

import { createContext, useContext } from "react";
import type { Team } from "@services/teams/types";

const AllTeamsContext = createContext<{ teams: Team[] }>({ teams: [] });

export const useAllTeams = (): React.ContextType<typeof AllTeamsContext> => {
    return useContext(AllTeamsContext);
};

type AllTeamsProviderProps = React.PropsWithChildren & {
    teams: Team[];
};

export const AllTeamsProvider = ({
    children,
    teams = [],
}: AllTeamsProviderProps) => {
    return (
        <AllTeamsContext.Provider value={{ teams }}>
            {children}
        </AllTeamsContext.Provider>
    );
};

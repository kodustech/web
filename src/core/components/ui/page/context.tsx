"use client";

import { createContext } from "react";

export const PageContext = createContext<{
    hasSidebar: boolean;
}>({ hasSidebar: false });

export const PageScrollableContext = createContext<boolean>(false);

export const PageWithSidebar = (props: React.PropsWithChildren) => {
    return (
        <PageContext.Provider value={{ hasSidebar: true }}>
            {props.children}
        </PageContext.Provider>
    );
};

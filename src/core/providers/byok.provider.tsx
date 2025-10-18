import { createContext, useContext } from "react";

const isBYOKContext = createContext(false);

export const IsBYOKProvider = ({
    children,
    isBYOK = false,
}: React.PropsWithChildren & {
    isBYOK?: boolean;
}) => {
    return (
        <isBYOKContext.Provider value={isBYOK}>
            {children}
        </isBYOKContext.Provider>
    );
};

export const useIsBYOK = () => {
    return useContext(isBYOKContext);
};

import { createContext, useContext } from "react";

const subscriptionStatusContext = createContext({
    isBYOK: false,
    isTrial: false,
});

export const SubsciptionStatusProvider = ({
    children,
    isBYOK = false,
    isTrial = false,
}: React.PropsWithChildren & {
    isBYOK: boolean;
    isTrial: boolean;
}) => {
    return (
        <subscriptionStatusContext.Provider value={{ isBYOK, isTrial }}>
            {children}
        </subscriptionStatusContext.Provider>
    );
};

export const useSubscriptionStatus = () => {
    return useContext(subscriptionStatusContext);
};

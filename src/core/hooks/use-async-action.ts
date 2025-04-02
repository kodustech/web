import { useState } from "react";

export const useAsyncAction = <
    P extends Promise<unknown>,
    Params extends unknown[],
>(
    fn: (...params: Params) => P,
) => {
    const [loading, setLoading] = useState(false);

    const action = (...params: Params) => {
        setLoading(true);

        fn(...params).finally(() => {
            setLoading(false);
        });
    };

    return [action, { loading }] as const;
};

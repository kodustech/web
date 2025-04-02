import { useQueryClient } from "@tanstack/react-query";

import { generateQueryKey } from "../utils/reactQuery";

export const useReactQueryInvalidateQueries = () => {
    const queryClient = useQueryClient();

    /** Why functions below are declared this way: https://github.com/TanStack/query/issues/1575 */

    const resetQueries = (
        ...params: Parameters<typeof queryClient.resetQueries>
    ) => queryClient.resetQueries(...params);

    const cancelQueries = (
        ...params: Parameters<typeof queryClient.cancelQueries>
    ) => queryClient.cancelQueries(...params);

    const removeQueries = (
        ...params: Parameters<typeof queryClient.removeQueries>
    ) => queryClient.removeQueries(...params);

    const refetchQueries = (
        ...params: Parameters<typeof queryClient.refetchQueries>
    ) => queryClient.refetchQueries(...params);

    const invalidateQueries = (
        ...params: Parameters<typeof queryClient.invalidateQueries>
    ) => queryClient.invalidateQueries(...params);

    return {
        generateQueryKey,
        resetQueries,
        cancelQueries,
        removeQueries,
        refetchQueries,
        invalidateQueries,
    };
};

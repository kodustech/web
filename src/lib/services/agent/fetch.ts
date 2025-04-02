import { UseMutationResult } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { usePost } from "src/core/utils/reactQuery";

import { AGENT_PATHS } from ".";

export const useExecuteAgent = (): UseMutationResult<
    any, // Tipo do retorno
    AxiosError, // Tipo de erro
    { type: string; teamId: string }, // Tipo do payload
    unknown // Tipo do contexto de rollback
> => {
    return usePost<any, { type: string; teamId: string }>(
        AGENT_PATHS.EXECUTE_AGENT,
    );
};

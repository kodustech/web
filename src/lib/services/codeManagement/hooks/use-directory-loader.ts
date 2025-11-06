// @services/codeManagement/hooks/use-directory-loader.ts

import { useQuery } from "@tanstack/react-query";

export const useDirectoryLoader = (
    loadDirectory: (path: string | null) => Promise<any[]>,
    directoryPath: string,
    repositoryId: string,
    enabled: boolean,
) => { 
    
    return useQuery({
        queryKey: ["directory-lazy", repositoryId, directoryPath],
        queryFn: () => {
            console.log('🚀 Fetching directory:', directoryPath);
            return loadDirectory(directoryPath);
        },
        enabled,
        staleTime: 15 * 60 * 1000,
    });
};
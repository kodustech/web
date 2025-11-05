// @services/codeManagement/hooks/use-directory-loader.ts

import { useQuery } from "@tanstack/react-query";

// use-directory-loader.ts
export const useDirectoryLoader = (
    loadDirectory: (path: string | null) => Promise<any[]>,
    directoryPath: string,
    enabled: boolean,
) => {
    console.log('🔍 useDirectoryLoader:', { directoryPath, enabled }); 
    
    return useQuery({
        queryKey: ["directory-lazy", directoryPath],
        queryFn: () => {
            console.log('🚀 Fetching directory:', directoryPath);
            return loadDirectory(directoryPath);
        },
        enabled,
        staleTime: 15 * 60 * 1000,
    });
};
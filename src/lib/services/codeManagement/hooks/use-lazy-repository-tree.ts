// @services/codeManagement/hooks/use-lazy-repository-tree.ts

import { useCallback, useEffect, useState } from "react"; // ← ADICIONAR useEffect
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "src/core/providers/auth.provider";
import { pathToApiUrl } from "src/core/utils/helpers";
import { addSearchParamsToUrl } from "src/core/utils/url";

interface DirectoryItem {
    name: string;
    path: string;
    sha: string;
    hasChildren: boolean;
}

interface RepositoryTreeByDirectoryResponse {
    repository: string | null;
    parentPath: string | null;
    currentPath: string | null;
    directories: DirectoryItem[];
}

export const useLazyRepositoryTree = (params: {
    organizationId: string;
    repositoryId: string;
    teamId: string;
}) => {
    const { accessToken } = useAuth();
    const [loadedDirectories, setLoadedDirectories] = useState<
        Map<string, DirectoryItem[]>
    >(new Map());
    const [repositoryName, setRepositoryName] = useState<string>("");

    // ← ADICIONAR: Resetar estados quando mudar repositoryId
    useEffect(() => {
        setLoadedDirectories(new Map());
        setRepositoryName("");
    }, [params.repositoryId]);

    // Função para buscar diretórios de um path específico
    const fetchDirectory = useCallback(
        async (directoryPath: string | null): Promise<DirectoryItem[]> => {
            const url = pathToApiUrl(
                "/code-management/get-repository-tree-by-directory",
            );

            const queryParams: Record<string, string> = {
                organizationId: params.organizationId,
                repositoryId: params.repositoryId,
                teamId: params.teamId,
                useCache: "true",
            };

            if (directoryPath) {
                queryParams.directoryPath = directoryPath;
            }

            const urlWithParams = addSearchParamsToUrl(url, queryParams);

            const response = await fetch(urlWithParams, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            const json = await response.json();

            if (json.statusCode !== 200 && json.statusCode !== 201) {
                throw new Error(
                    `Failed to fetch directory tree: ${json.statusCode}`,
                );
            }

            const data: RepositoryTreeByDirectoryResponse = json.data;

            // Salvar nome do repositório
            if (data.repository) {
                setRepositoryName(data.repository);
            }

            return data.directories;
        },
        [
            params.organizationId,
            params.repositoryId,
            params.teamId,
            accessToken,
        ],
    );

    // Carregar diretórios e salvar no estado
    const loadDirectory = useCallback(
        async (directoryPath: string | null) => {
            const key = directoryPath || "root";

            // Se já carregou, não buscar de novo
            if (loadedDirectories.has(key)) {
                return loadedDirectories.get(key)!;
            }

            const directories = await fetchDirectory(directoryPath);

            setLoadedDirectories((prev) => {
                const newMap = new Map(prev);
                newMap.set(key, directories);
                return newMap;
            });

            return directories;
        },
        [loadedDirectories, fetchDirectory],
    );

    // Carregar a raiz na montagem do componente
    const { data: rootDirectories, isLoading: isLoadingRoot } = useQuery({
        queryKey: [
            "repository-tree-lazy",
            params.organizationId,
            params.repositoryId,
            "root",
        ],
        queryFn: () => loadDirectory(null),
        staleTime: 15 * 60 * 1000,
    });

    return {
        repositoryName,
        rootDirectories: rootDirectories || [],
        isLoadingRoot,
        loadDirectory,
        loadedDirectories,
    };
};

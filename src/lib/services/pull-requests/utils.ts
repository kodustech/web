import type { PullRequestExecution } from "./types";

/**
 * Constrói a URL real do Pull Request baseado no provider e dados do repositório
 */
export const buildPullRequestUrl = (pr: PullRequestExecution): string => {

    console.log("pr", pr);
    const { provider, repositoryId, prNumber, url } = pr;

    console.log("provider", provider);

    // Tenta extrair informações da URL da API para construir a URL real
    switch (provider) {
        case "GITHUB":
            // GitHub API URL: https://api.github.com/repos/{owner}/{repo}/pulls/{number}
            if (url && url.includes("api.github.com")) {
                const apiMatch = url.match(
                    /api\.github\.com\/repos\/([^\/]+)\/([^\/]+)\/pulls/,
                );
                if (apiMatch) {
                    const [, owner, repo] = apiMatch;
                    return `https://github.com/${owner}/${repo}/pull/${prNumber}`;
                }
            }
            // Se a URL já é do GitHub (não API), usa ela
            if (
                url &&
                url.includes("github.com") &&
                !url.includes("api.github.com")
            ) {
                return url;
            }
            break;

        case "GITLAB":
            // GitLab API URL: https://gitlab.com/api/v4/projects/{id}/merge_requests/{number}
            if (url && url.includes("gitlab.com")) {
                // Tenta extrair o project ID da URL da API
                const projectMatch = url.match(
                    /gitlab\.com\/api\/v4\/projects\/([^\/]+)/,
                );
                if (projectMatch) {
                    // Para GitLab, geralmente precisamos do namespace/project, não apenas o ID
                    // Por enquanto, construímos uma URL genérica com o repositoryName se disponível
                    if (pr.repositoryName) {
                        // Assume que o repositoryName pode conter o namespace
                        return `https://gitlab.com/${pr.repositoryName}/-/merge_requests/${prNumber}`;
                    }
                }
            }
            // Se a URL já é do GitLab (não API), usa ela
            if (url && url.includes("gitlab.com") && !url.includes("/api/")) {
                return url;
            }
            break;

        case "BITBUCKET":
            console.log("url", url);
            // Bitbucket API URL: https://api.bitbucket.org/2.0/repositories/{workspace}/{repo}/pullrequests/{number}
            if (url && url.includes("api.bitbucket.org")) {
                const apiMatch = url.match(
                    /api\.bitbucket\.org\/2\.0\/repositories\/([^\/]+)\/([^\/]+)/,
                );
                if (apiMatch) {
                    const [, workspace, repo] = apiMatch;
                    return `https://bitbucket.org/${workspace}/${repo}/pull-requests/${prNumber}`;
                }
            }
            // Se a URL já é do Bitbucket (não API), usa ela
            if (
                url &&
                url.includes("bitbucket.org") &&
                !url.includes("api.bitbucket.org")
            ) {
                return url;
            }
            break;

        case "AZURE_REPOS":
            // Azure DevOps tem URLs complexas, por enquanto mantém a original
            if (
                url &&
                url.includes("dev.azure.com") &&
                !url.includes("/_apis/")
            ) {
                return url;
            }
            // Tenta construir URL básica se tiver informações suficientes
            if (url && url.includes("/_apis/")) {
                const orgMatch = url.match(/dev\.azure\.com\/([^\/]+)/);
                if (orgMatch && pr.repositoryName) {
                    const [, organization] = orgMatch;
                    // Estrutura básica do Azure DevOps
                    return `https://dev.azure.com/${organization}/_git/${pr.repositoryName}/pullrequest/${prNumber}`;
                }
            }
            break;
    }

    // Fallback: se não conseguiu construir uma URL específica, usa a original ou placeholder
    if (url && !url.includes("/api") && !url.includes("/_apis/")) {
        return url;
    }

    // Último fallback: link interno temporário
    return `#pr-${prNumber}`;
};

/**
 * Verifica se a URL é válida (não é da API)
 */
export const isValidPullRequestUrl = (url: string): boolean => {
    return Boolean(url && !url.includes("/api/") && url.startsWith("http"));
};

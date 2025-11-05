"use client";

import { useState } from "react";
import { Tree } from "@components/ui/tree";
import { useDirectoryLoader } from "@services/codeManagement/hooks/use-directory-loader";
import { useLazyRepositoryTree } from "@services/codeManagement/hooks/use-lazy-repository-tree";
import { useSuspenseGetCodeReviewParameter } from "@services/parameters/hooks";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";
import { useOrganizationContext } from "src/features/organization/_providers/organization-context";

interface DirectoryItem {
    name: string;
    path: string;
    sha: string;
    hasChildren: boolean;
}

const LazyTreeFolder = ({
    directory,
    loadDirectory,
    repository,
}: {
    directory: DirectoryItem;
    loadDirectory: (path: string | null) => Promise<DirectoryItem[]>;
    repository: any;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const path = `/${directory.path}`;

    const { data: children, isLoading } = useDirectoryLoader(
        loadDirectory,
        directory.path,
        isOpen && directory.hasChildren,
    );

    const isDisabled = repository?.directories?.some(
        (d: any) => path.startsWith(`${d.path}/`) || path === d.path,
    );

    console.log('📁 LazyTreeFolder:', { 
        name: directory.name, 
        isOpen, 
        hasChildren: directory.hasChildren,
        childrenCount: children?.length 
    });

    return (
        <Tree.Folder
            key={directory.path}
            name={directory.name}
            value={path}
            disabled={isDisabled}
            hasChildren={directory.hasChildren}
            onOpenChange={setIsOpen}>
            
            {isLoading && (
                <div className="text-xs text-gray-500 ml-4 py-1">
                    Loading...
                </div>
            )}
            
            {!isLoading && children && children.length > 0 && 
                children.map((child) => (
                    <LazyTreeFolder
                        key={child.path}
                        directory={child}
                        loadDirectory={loadDirectory}
                        repository={repository}
                    />
                ))
            }
            
            {!isLoading && children && children.length === 0 && (
                <div className="text-xs text-gray-400 ml-4 py-1">
                    Empty
                </div>
            )}
        </Tree.Folder>
    );
};

export const GitDirectorySelector = ({
    repositoryId,
    ...props
}: {
    repositoryId: string;
} & React.ComponentProps<typeof Tree.Root>) => {
    const { teamId } = useSelectedTeamId();
    const { organizationId } = useOrganizationContext();
    const { configValue } = useSuspenseGetCodeReviewParameter(teamId);

    const repository = configValue?.repositories.find(
        (r) => r.id === repositoryId,
    );

    const {
        repositoryName,
        rootDirectories,
        isLoadingRoot,
        loadDirectory,
    } = useLazyRepositoryTree({
        organizationId,
        repositoryId,
        teamId,
    });

    if (isLoadingRoot) {
        return <div>Loading...</div>;
    }

    return (
        <Tree.Root {...props}>
            <Tree.Folder
                value="/"
                name={repositoryName || "Repository"}
                disabled={repository?.isSelected}>
                
                {rootDirectories.map((dir) => {
                    return (
                        <LazyTreeFolder
                            key={dir.path}
                            directory={dir}
                            loadDirectory={loadDirectory}
                            repository={repository}
                        />
                    );
                })}
            </Tree.Folder>
        </Tree.Root>
    );
};

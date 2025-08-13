"use client";

import { useCallback } from "react";
import { Tree } from "@components/ui/tree";
import { useSuspenseGetRepositoryTree } from "@services/codeManagement/hooks";
import { useSuspenseGetCodeReviewParameter } from "@services/parameters/hooks";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";
import { useOrganizationContext } from "src/features/organization/_providers/organization-context";

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

    const directoryTree = useSuspenseGetRepositoryTree({
        repositoryId,
        organizationId,
        teamId,
        treeType: "directories",
    });

    const ComponentTree = useCallback(
        (tree: (typeof directoryTree)["tree"] = []) =>
            tree.map((t) => {
                const path = `/${t.path}`;
                return (
                    <Tree.Folder
                        key={t.name}
                        name={t.name}
                        value={path}
                        disabled={repository?.directories?.some(
                            (d) =>
                                // disable already selected directories and all levels of subdirectories from it
                                path.startsWith(`${d.path}/`) ||
                                path === d.path,
                        )}>
                        {ComponentTree(t.subdirectories)}
                    </Tree.Folder>
                );
            }),
        [],
    );

    return (
        <Tree.Root {...props}>
            <Tree.Folder
                value="/"
                name={directoryTree.repository}
                disabled={repository?.isSelected}>
                {ComponentTree(directoryTree.tree)}
            </Tree.Folder>
        </Tree.Root>
    );
};

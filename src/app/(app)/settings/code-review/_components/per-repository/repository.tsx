"use client";

import { Button } from "@components/ui/button";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleIndicator,
    CollapsibleTrigger,
} from "@components/ui/collapsible";
import { Link } from "@components/ui/link";
import { magicModal } from "@components/ui/magic-modal";
import {
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubItem,
} from "@components/ui/sidebar";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@components/ui/tooltip";
import type { useSuspenseGetParameterPlatformConfigs } from "@services/parameters/hooks";
import { KodyLearningStatus } from "@services/parameters/types";
import { Plus } from "lucide-react";

import { useCodeReviewRouteParams } from "../../_hooks";
import type { AutomationCodeReviewConfigType } from "../../_types";
import { AddRepoModal } from "../copy-settings-modal";
import { PerDirectory } from "./directory";
import { SidebarRepositoryOrDirectoryDropdown } from "./options-dropdown";

export const PerRepository = ({
    configValue,
    routes,
    platformConfig,
}: {
    configValue: AutomationCodeReviewConfigType;
    platformConfig: ReturnType<typeof useSuspenseGetParameterPlatformConfigs>;
    routes: Array<{ label: string; href: string }>;
}) => {
    const { repositoryId, directoryId, pageName } = useCodeReviewRouteParams();

    return (
        <SidebarMenuItem>
            <div className="pl-2">
                <div className="flex justify-between">
                    <div className="mb-4 flex flex-col gap-0.5">
                        <strong>Per repository</strong>
                        <span className="text-text-secondary text-xs">
                            Set custom configurations for each repository
                            (override global defaults).
                        </span>
                    </div>

                    <Button
                        size="icon-sm"
                        variant="secondary"
                        onClick={() => {
                            magicModal.show(() => (
                                <AddRepoModal
                                    repositories={configValue?.repositories}
                                />
                            ));
                        }}
                        disabled={
                            platformConfig.configValue.kodyLearningStatus ===
                            KodyLearningStatus.GENERATING_CONFIG
                        }>
                        <Plus />
                    </Button>
                </div>
            </div>

            <div className="flex flex-col gap-1">
                {configValue?.repositories
                    ?.filter((r) => r.isSelected || r.directories)
                    .map((r) => {
                        const hasRepositoryConfig = r.isSelected;

                        return (
                            <Collapsible
                                key={r.id}
                                defaultOpen={repositoryId === r.id}>
                                <div className="flex items-center justify-between gap-2">
                                    <Tooltip disableHoverableContent>
                                        <CollapsibleTrigger asChild>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    size="md"
                                                    variant="helper"
                                                    className="h-fit flex-1 justify-start py-2"
                                                    leftIcon={
                                                        <CollapsibleIndicator className="-ml-1 group-data-[state=closed]/collapsible:rotate-[-90deg] group-data-[state=open]/collapsible:rotate-0" />
                                                    }>
                                                    <span className="line-clamp-1 truncate text-ellipsis">
                                                        {r.name}
                                                    </span>
                                                </Button>
                                            </TooltipTrigger>
                                        </CollapsibleTrigger>

                                        <TooltipContent
                                            side="right"
                                            className="text-sm">
                                            {r.name}
                                        </TooltipContent>
                                    </Tooltip>

                                    {hasRepositoryConfig && (
                                        <SidebarRepositoryOrDirectoryDropdown
                                            repository={r}
                                        />
                                    )}
                                </div>

                                <CollapsibleContent>
                                    <SidebarMenuSub>
                                        {hasRepositoryConfig &&
                                            routes.map(({ label, href }) => {
                                                const active =
                                                    repositoryId === r.id &&
                                                    pageName === href &&
                                                    !directoryId;

                                                return (
                                                    <SidebarMenuSubItem
                                                        key={label}>
                                                        <Link
                                                            className="w-full"
                                                            href={`/settings/code-review/${r.id}/${href}`}>
                                                            <Button
                                                                key={label}
                                                                decorative
                                                                size="sm"
                                                                variant="cancel"
                                                                active={active}
                                                                className="min-h-auto w-full justify-start px-0 py-2">
                                                                {label}
                                                            </Button>
                                                        </Link>
                                                    </SidebarMenuSubItem>
                                                );
                                            })}

                                        {r.directories?.map((d) => (
                                            <PerDirectory
                                                key={d.id}
                                                directory={d}
                                                repository={r}
                                                routes={routes}
                                            />
                                        ))}
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </Collapsible>
                        );
                    })}
            </div>
        </SidebarMenuItem>
    );
};

"use client";

import { Button } from "@components/ui/button";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleIndicator,
    CollapsibleTrigger,
} from "@components/ui/collapsible";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { Link } from "@components/ui/link";
import { magicModal } from "@components/ui/magic-modal";
import {
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubItem,
} from "@components/ui/sidebar";
import type { useSuspenseGetParameterPlatformConfigs } from "@services/parameters/hooks";
import { KodyLearningStatus } from "@services/parameters/types";
import { EllipsisIcon, Plus, TrashIcon } from "lucide-react";

import { DeleteRepoConfigModal } from "./delete-config-modal";
import type { AutomationCodeReviewConfigType } from "./pages/types";

export const PerRepository = ({
    addNewRepo,
    configValue,
    routes,
    repositoryParam,
    platformConfig,
    pageNameParam,
    teamId,
}: {
    addNewRepo: () => void;
    configValue: AutomationCodeReviewConfigType;
    pageNameParam: string | undefined;
    repositoryParam: string | undefined;
    platformConfig: ReturnType<typeof useSuspenseGetParameterPlatformConfigs>;
    routes: Array<{ label: string; href: string }>;
    teamId: string;
}) => {
    return (
        <SidebarMenuItem>
            <div className="px-2 pb-2 font-semibold">
                <div className="flex items-center justify-between">
                    <strong>Per repository</strong>

                    <Button
                        size="icon-sm"
                        variant="secondary"
                        onClick={addNewRepo}
                        disabled={
                            platformConfig.configValue.kodyLearningStatus ===
                            KodyLearningStatus.GENERATING_CONFIG
                        }>
                        <Plus />
                    </Button>
                </div>
                <span className="text-text-secondary mt-2 mb-2 block max-w-52">
                    Set custom configurations for each repository (override
                    global defaults).
                </span>
            </div>

            <div className="flex flex-col gap-1">
                {configValue?.repositories
                    ?.filter((repository) => repository.isSelected)
                    .map((repository) => {
                        const active = routes.some(
                            ({ href }) =>
                                repositoryParam === repository.id &&
                                pageNameParam === href,
                        );

                        return (
                            <Collapsible
                                key={repository.id}
                                className="group/collapsible"
                                defaultOpen={repositoryParam === repository.id}>
                                <div className="flex items-center justify-between gap-2">
                                    <CollapsibleTrigger asChild>
                                        <Button
                                            size="md"
                                            variant={
                                                active ? "helper" : "cancel"
                                            }
                                            className="h-fit w-full justify-start py-2"
                                            active={active}
                                            leftIcon={
                                                <CollapsibleIndicator className="group-data-[state=closed]/collapsible:rotate-[-90deg] group-data-[state=open]/collapsible:rotate-0" />
                                            }>
                                            {repository.name}
                                        </Button>
                                    </CollapsibleTrigger>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                size="icon-sm"
                                                variant="cancel">
                                                <EllipsisIcon className="size-5!" />
                                            </Button>
                                        </DropdownMenuTrigger>

                                        <DropdownMenuContent
                                            align="end"
                                            sideOffset={-6}>
                                            <DropdownMenuItem
                                                className="text-danger text-[13px] leading-none"
                                                onClick={() => {
                                                    magicModal.show(() => (
                                                        <DeleteRepoConfigModal
                                                            repository={{
                                                                id: repository.id,
                                                                name: repository.name,
                                                            }}
                                                            teamId={teamId}
                                                        />
                                                    ));
                                                }}>
                                                <TrashIcon className="-ml-1 size-4!" />
                                                Delete configuration
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <CollapsibleContent>
                                    <SidebarMenuSub>
                                        {routes.map(({ label, href }) => {
                                            const active =
                                                repositoryParam ===
                                                    repository.id &&
                                                pageNameParam === href;

                                            return (
                                                <SidebarMenuSubItem
                                                    className="flex flex-col gap-1"
                                                    key={label}>
                                                    <Link
                                                        href={`/settings/code-review/${repository.id}/${href}`}
                                                        className="w-full">
                                                        <Button
                                                            key={label}
                                                            decorative
                                                            size="md"
                                                            variant={
                                                                active
                                                                    ? "helper"
                                                                    : "cancel"
                                                            }
                                                            active={active}
                                                            className="w-full justify-start">
                                                            {label}
                                                        </Button>
                                                    </Link>
                                                </SidebarMenuSubItem>
                                            );
                                        })}
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </Collapsible>
                        );
                    })}
            </div>
        </SidebarMenuItem>
    );
};

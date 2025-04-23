"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@components/ui/button";
import { Separator } from "@components/ui/separator";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuItem,
} from "@components/ui/sidebar";
import { Cog } from "lucide-react";
import { useOrganizationContext } from "src/features/organization/_providers/organization-context";

export const ConfigsSidebar = () => {
    const { organizationName } = useOrganizationContext();
    const pathname = usePathname();
    const router = useRouter();

    const topItems = [
        {
            icon: Cog,
            label: "General",
            href: `/organization/general`,
        },
    ];

    return (
        <Sidebar className="bg-card-lv1">
            <SidebarContent className="gap-4">
                <SidebarGroupLabel>Settings</SidebarGroupLabel>
                <SidebarGroupLabel className="flex h-auto flex-col items-start gap-1 text-sm">
                    <strong className="text-text-secondary text-xs uppercase">
                        Organization
                    </strong>
                    <span>{organizationName}</span>
                </SidebarGroupLabel>

                <Separator />

                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {topItems.map(({ icon: Icon, ...project }) => {
                                const selected = pathname.startsWith(
                                    project.href,
                                );

                                return (
                                    <SidebarMenuItem key={project.label}>
                                        <Button
                                            size="md"
                                            leftIcon={<Icon />}
                                            active={selected}
                                            variant={
                                                selected ? "helper" : "cancel"
                                            }
                                            className="w-full justify-start border-none"
                                            onClick={() =>
                                                router.push(project.href)
                                            }>
                                            {project.label}
                                        </Button>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
};

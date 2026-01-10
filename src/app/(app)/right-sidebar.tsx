"use client";

import { GetStartedSidebarButton } from "@components/system/get-started-sidebar-button";
import {
    RightSidebar,
    RightSidebarItem,
} from "@components/system/right-sidebar";
import { SupportSidebarButton } from "@components/system/support-sidebar-button";

import { PreviewSidebarButton } from "./settings/code-review/_components/preview-sidebar-button";

interface AppRightSidebarProps {
    showPreview?: boolean;
}

export const AppRightSidebar = ({ showPreview }: AppRightSidebarProps) => {
    return (
        <RightSidebar>
            {showPreview && (
                <RightSidebarItem>
                    <PreviewSidebarButton />
                </RightSidebarItem>
            )}

            <RightSidebarItem>
                <GetStartedSidebarButton />
            </RightSidebarItem>

            <RightSidebarItem>
                <SupportSidebarButton />
            </RightSidebarItem>
        </RightSidebar>
    );
};

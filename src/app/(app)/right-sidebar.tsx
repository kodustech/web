"use client";

import {
    RightSidebar,
    RightSidebarItem,
} from "@components/system/right-sidebar";
import { SupportSidebarButton } from "@components/system/support-sidebar-button";

import { TestReviewSidebarButton } from "./settings/code-review/_components/preview-sidebar-button";

interface AppRightSidebarProps {
    showTestReview?: boolean;
}

export const AppRightSidebar = ({ showTestReview }: AppRightSidebarProps) => {
    return (
        <RightSidebar>
            {showTestReview && (
                <RightSidebarItem>
                    <TestReviewSidebarButton />
                </RightSidebarItem>
            )}

            <RightSidebarItem>
                <SupportSidebarButton />
            </RightSidebarItem>
        </RightSidebar>
    );
};

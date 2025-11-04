import type { Metadata } from "next";
import { GetStartedChecklist } from "@components/system/get-started-checklist";

import { SettingsLayout } from "./_components/_layout";

export const metadata: Metadata = {
    title: "Code Review Settings",
    openGraph: { title: "Code Review Settings" },
};

export default async function Layout({ children }: React.PropsWithChildren) {
    return (
        <SettingsLayout>
            {children}
            <GetStartedChecklist />
        </SettingsLayout>
    );
}

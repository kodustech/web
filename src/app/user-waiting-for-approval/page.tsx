import { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { auth } from "src/core/config/auth";

import { UserWaitingForApprovalPage } from "./_components/page.client";

export const metadata: Metadata = {
    title: "Waiting for approval",
};

export default async function WaitingForApprovalPage() {
    const session = await auth();

    return (
        <SessionProvider session={session}>
            <UserWaitingForApprovalPage />
        </SessionProvider>
    );
}

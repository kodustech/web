import { Metadata } from "next";
import { auth } from "src/core/config/auth";
import { AuthProvider } from "src/core/providers/auth.provider";

import { UserWaitingForApprovalPage } from "./_components/page.client";

export const metadata: Metadata = {
    title: "Waiting for approval",
};

export default async function WaitingForApprovalPage() {
    const session = await auth();

    return (
        <AuthProvider session={session}>
            <UserWaitingForApprovalPage />
        </AuthProvider>
    );
}

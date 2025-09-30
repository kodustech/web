import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "src/core/config/auth";
import { AuthProvider } from "src/core/providers/auth.provider";

import { ConfirmEmailAuthenticatedView } from "./_components/confirm-email-authenticated.client";
import { ConfirmEmailGuestView } from "./_components/confirm-email-guest.client";

export const metadata: Metadata = {
    title: "Confirm email",
};

export default async function ConfirmEmailPage() {
    const session = await auth();

    const normalizedStatus = session?.user?.status
        ? String(session.user.status).toLowerCase()
        : undefined;

    const requiresEmailConfirmation = normalizedStatus
        ? ["pending", "pending_email"].includes(normalizedStatus)
        : false;

    if (session && !requiresEmailConfirmation) {
        redirect("/settings");
    }

    if (!session) {
        return <ConfirmEmailGuestView />;
    }

    return (
        <AuthProvider session={session}>
            <ConfirmEmailAuthenticatedView />
        </AuthProvider>
    );
}

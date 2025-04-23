"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heading } from "@components/ui/heading";
import { Page } from "@components/ui/page";
import { Spinner } from "@components/ui/spinner";
import { useReactQueryInvalidateQueries } from "@hooks/use-invalidate-queries";
import { signOut } from "next-auth/react";
import { ClientSideCookieHelpers } from "src/core/utils/cookie";

export default function App() {
    const router = useRouter();
    const { removeQueries } = useReactQueryInvalidateQueries();

    useEffect(() => {
        const redirectToSignInPage = async () => {
            const data = await signOut({
                redirect: false,
                callbackUrl: "/sign-in",
            });

            // remove this page from the history, for user to be unable to go back
            router.replace(data.url);
        };

        ClientSideCookieHelpers("global-selected-team-id").delete();
        ClientSideCookieHelpers("started-setup-from-new-setup-page").delete();
        ClientSideCookieHelpers("selectedTeam").delete();
        removeQueries();
        redirectToSignInPage();
    }, []);

    return (
        <Page.Root className="flex h-full w-full flex-col flex-row items-center justify-center gap-6">
            <Spinner />
            <Heading>Disconnecting...</Heading>
        </Page.Root>
    );
}

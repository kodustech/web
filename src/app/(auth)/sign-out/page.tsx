"use client";

import { useEffect } from "react";
import { Heading } from "@components/ui/heading";
import { Page } from "@components/ui/page";
import { useReactQueryInvalidateQueries } from "@hooks/use-invalidate-queries";
import { signOut } from "next-auth/react";
import { ClientSideCookieHelpers } from "src/core/utils/cookie";

export default function App() {
    const { removeQueries } = useReactQueryInvalidateQueries();

    useEffect(() => {
        ClientSideCookieHelpers("global-selected-team-id").delete();
        ClientSideCookieHelpers("started-setup-from-new-setup-page").delete();
        ClientSideCookieHelpers("selectedTeam").delete();
        removeQueries();

        signOut({ redirect: true, callbackUrl: "/sign-in" });
    }, []);

    return (
        <Page.Root className="flex h-full w-full flex-col items-center justify-center">
            <Heading className="text-center">Disconnecting...</Heading>
        </Page.Root>
    );
}

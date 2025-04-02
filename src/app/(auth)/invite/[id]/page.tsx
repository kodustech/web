import { Suspense } from "react";
import type { Metadata } from "next";
import { Heading } from "@components/ui/heading";
import { SvgKodus } from "@components/ui/icons/SvgKodus";
import { Page } from "@components/ui/page";
import { getInviteData } from "src/lib/auth/fetchers";

import { AcceptInviteForm } from "../../components/invite-form";

export const metadata: Metadata = {
    title: "Accept invite",
};

export default async function InvitePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const userData = await getInviteData(id);

    return (
        <Page.Root className="flex h-full w-full flex-col items-center overflow-auto py-20">
            <div className="flex w-[90%] flex-1 flex-col items-center justify-center gap-10 md:max-w-[500px]">
                <Page.Header className="flex w-full flex-col items-center gap-10">
                    <SvgKodus className="h-8" />

                    <div className="flex flex-col items-center gap-2">
                        <Heading variant="h2" className="text-center">
                            Welcome to Kodus!
                        </Heading>

                        <p className="text-center text-sm text-muted-foreground">
                            You've been invited to join{" "}
                            <strong>{userData?.organization?.name}</strong> with
                            email <strong>{userData?.email}</strong>.
                        </p>
                    </div>
                </Page.Header>

                <Page.Content className="flex-none gap-4">
                    <Suspense>
                        <AcceptInviteForm
                            email={userData.email}
                            inviteId={userData.uuid}
                            organizationName={userData.organization?.name}
                        />
                    </Suspense>
                </Page.Content>
            </div>
        </Page.Root>
    );
}

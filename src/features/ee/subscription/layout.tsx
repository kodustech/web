"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Link } from "@components/ui/link";
import { magicModal } from "@components/ui/magic-modal";
import { Page } from "@components/ui/page";
import { Spinner } from "@components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { PlusIcon, SearchIcon, ServerIcon } from "lucide-react";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";
import { isSelfHosted } from "src/core/utils/self-hosted";

import { InviteModal } from "./_components/invite-modal";
import { TableFilterContext } from "./_providers/table-filter-context";

const tabs = {
    prs: "pr-licenses",
    admins: "organization-admins",
} as const;

// Componente para exibir informações de modo self-hosted
const SelfHostedInfo = () => {
    return (
        <div className="-mt-10 flex h-full flex-col items-center justify-center text-center">
            <div className="bg-brand-amber/20 mb-6 rounded-full p-4">
                <ServerIcon className="text-brand-amber h-12 w-12" />
            </div>
            <h2 className="mb-2 text-2xl font-bold">Self-Hosted Mode</h2>

            <div className="text-text-secondary mb-6 max-w-md space-y-0.5">
                <p>
                    You're running Kodus in <strong>Self-Hosted</strong> mode.
                </p>

                <p>In this mode, license management is not available.</p>
            </div>

            <div className="mt-6">
                <Link
                    href="https://docs.kodus.io/how_to_use/en/pricing"
                    className="text-brand-amber text-sm font-medium hover:underline">
                    Learn more in our documentation
                </Link>
            </div>
        </div>
    );
};

export default function SubscriptionLayout({
    status,
    admins,
    licenses,
}: {
    admins: React.ReactNode;
    status: React.ReactNode;
    licenses: React.ReactNode;
}) {
    const searchParams = useSearchParams();
    const [selectedTab, setSelectedTab] = useState<string>(
        tabs[searchParams.get("tab") as keyof typeof tabs] ?? tabs.prs,
    );
    const [query, setQuery] = useState("");
    const { teamId } = useSelectedTeamId();

    if (isSelfHosted)
        return (
            <Page.Root>
                <SelfHostedInfo />
            </Page.Root>
        );

    return (
        <Page.Root>
            <Page.Header>{status}</Page.Header>

            <Page.Content>
                <TableFilterContext value={{ query, setQuery }}>
                    <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                        <TabsList className="mt-5">
                            <TabsTrigger value={tabs.prs}>
                                PR licenses
                            </TabsTrigger>
                            <TabsTrigger value={tabs.admins}>
                                Organization admins
                            </TabsTrigger>

                            <div className="mb-5 flex h-full flex-1 items-center justify-end">
                                <div className="flex items-center gap-2">
                                    <Input
                                        size="md"
                                        value={query}
                                        className="w-52"
                                        leftIcon={<SearchIcon />}
                                        placeholder="Find by name"
                                        onChange={(e) =>
                                            setQuery(e.target.value)
                                        }
                                    />

                                    {selectedTab === tabs.admins && (
                                        <Button
                                            size="md"
                                            variant="helper"
                                            leftIcon={<PlusIcon />}
                                            onClick={() => {
                                                magicModal.show(() => (
                                                    <InviteModal
                                                        teamId={teamId}
                                                    />
                                                ));
                                            }}>
                                            Invite admin
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </TabsList>

                        <TabsContent value={tabs.prs}>
                            <Suspense
                                fallback={
                                    <Card className="flex h-40 flex-col items-center justify-center gap-3 bg-transparent shadow-none">
                                        <Spinner />
                                        <p className="text-sm">
                                            Loading users...
                                        </p>
                                    </Card>
                                }>
                                {licenses}
                            </Suspense>
                        </TabsContent>

                        <Suspense>
                            <TabsContent value={tabs.admins}>
                                {admins}
                            </TabsContent>
                        </Suspense>
                    </Tabs>
                </TableFilterContext>
            </Page.Content>
        </Page.Root>
    );
}

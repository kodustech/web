"use client";

import { Suspense, useState } from "react";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { DataTableSearchQueryContext } from "@components/ui/data-table";
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

const prLicensesTabName = "pr-licenses";
const organizationAdminsTabName = "organization-admins";

// Componente para exibir informações de modo self-hosted
const SelfHostedInfo = () => {
    return (
        <div className="-mt-10 flex h-full flex-col items-center justify-center text-center">
            <div className="bg-brand-amber/20 mb-6 rounded-full p-4">
                <ServerIcon className="text-brand-amber h-12 w-12" />
            </div>
            <h2 className="mb-2 text-2xl font-bold">Self-Hosted Mode</h2>

            <div className="mb-6 max-w-md space-y-0.5 text-muted-foreground">
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
    const [selectedTab, setSelectedTab] = useState(prLicensesTabName);
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
                <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                    <TabsList>
                        <TabsTrigger value={prLicensesTabName}>
                            PR licenses
                        </TabsTrigger>
                        <TabsTrigger value={organizationAdminsTabName}>
                            Organization admins
                        </TabsTrigger>

                        <div className="mb-4 flex h-full flex-1 items-center justify-end">
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Input
                                        placeholder="Find by name"
                                        className="h-10 w-52 pl-10"
                                        value={query}
                                        onChange={(e) =>
                                            setQuery(e.target.value)
                                        }
                                    />

                                    <div className="pointer-events-none absolute left-3 top-3">
                                        <SearchIcon className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                </div>

                                {selectedTab === organizationAdminsTabName && (
                                    <Button
                                        className="h-10"
                                        variant="outline"
                                        leftIcon={<PlusIcon />}
                                        onClick={async () => {
                                            const a = await magicModal.show(
                                                () => (
                                                    <InviteModal
                                                        teamId={teamId}
                                                    />
                                                ),
                                            );
                                        }}>
                                        Invite admin
                                    </Button>
                                )}
                            </div>
                        </div>
                    </TabsList>

                    <DataTableSearchQueryContext.Provider
                        value={{ query, setQuery }}>
                        <TabsContent value={prLicensesTabName}>
                            <Suspense
                                fallback={
                                    <Card className="flex h-40 flex-col items-center justify-center gap-3 rounded-none bg-transparent">
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
                            <TabsContent value={organizationAdminsTabName}>
                                {admins}
                            </TabsContent>
                        </Suspense>
                    </DataTableSearchQueryContext.Provider>
                </Tabs>
            </Page.Content>
        </Page.Root>
    );
}

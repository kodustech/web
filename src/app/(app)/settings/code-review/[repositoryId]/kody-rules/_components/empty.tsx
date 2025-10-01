"use client";

import { Suspense } from "react";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Heading } from "@components/ui/heading";
import { KodyRuleLibraryItem } from "@components/ui/kody-rules/library-item-card";
import { Link } from "@components/ui/link";
import { Spinner } from "@components/ui/spinner";
import { useSuspenseFindLibraryKodyRules } from "@services/kodyRules/hooks";
import { Plus } from "lucide-react";

import { useCodeReviewRouteParams } from "../../../../_hooks";

const NoItems = () => {
    const rules = useSuspenseFindLibraryKodyRules();
    const { repositoryId, directoryId } = useCodeReviewRouteParams();

    return rules
        .slice(0, 3)
        .map((r) => (
            <KodyRuleLibraryItem
                rule={r}
                key={r.uuid}
                repositoryId={repositoryId}
                directoryId={directoryId}
            />
        ));
};

const NoItemsViewMore = () => (
    <Link href="/library/kody-rules" className="w-full">
        <Button
            decorative
            size="lg"
            variant="helper"
            className="h-full w-full"
            leftIcon={<Plus />}>
            View more
        </Button>
    </Link>
);

type KodyRulesEmptyStateProps = {
    canEdit: boolean;
    onAddNewRule: () => void;
};

export const KodyRulesEmptyState = ({
    canEdit,
    onAddNewRule,
}: KodyRulesEmptyStateProps) => {
    return (
        <div className="mt-4 flex min-h-[540px] flex-col gap-2">
            <div className="flex flex-col gap-1">
                <Heading variant="h2">Start with Discovery 🚀</Heading>
                <p className="text-text-secondary text-sm">
                    <strong>No rules yet?</strong> Import best practices or
                    create your own by clicking on{" "}
                    <Link
                        href=""
                        disabled={!canEdit}
                        onClick={(ev) => {
                            ev.preventDefault();
                            onAddNewRule();
                        }}>
                        New Rule
                    </Link>
                    .
                </p>
            </div>
            <div className="mt-4 grid h-full grid-cols-2 gap-2">
                <Suspense
                    fallback={
                        <>
                            {new Array(3).fill(null).map((_, index) => (
                                <Card
                                    key={index}
                                    className="h-full flex-1 items-center justify-center">
                                    <Spinner />
                                </Card>
                            ))}
                        </>
                    }>
                    <NoItems />
                </Suspense>
                <NoItemsViewMore />
            </div>
        </div>
    );
};

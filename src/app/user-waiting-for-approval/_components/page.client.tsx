"use client";

import Link from "next/link";
import { redirect, useRouter } from "next/navigation";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Heading } from "@components/ui/heading";
import { SvgKodus } from "@components/ui/icons/SvgKodus";
import { Page } from "@components/ui/page";
import { UserStatus } from "@enums";
import { useEffectOnce } from "@hooks/use-effect-once";
import { useInterval } from "@hooks/use-interval";
import { TypedFetchError } from "@services/fetch";
import { LogOutIcon } from "lucide-react";
import { useAuth } from "src/core/providers/auth.provider";

export const UserWaitingForApprovalPage = () => {
    const router = useRouter();
    const { status, email, refreshAccessTokens } = useAuth();

    const getOut = () => router.replace("/");

    useEffectOnce(() => {
        if (status !== UserStatus.AWAITING_APPROVAL) getOut();
    });

    useInterval(() => {
        refreshAccessTokens()
            .then((newSession) => {
                if (newSession?.user.status !== UserStatus.AWAITING_APPROVAL) {
                    getOut();
                }
            })
            .catch((error) => {
                if (TypedFetchError.isError(error) && error.statusCode === 401)
                    redirect("/sign-out");
            });
    }, 60000);

    return (
        <Page.Root className="flex h-full w-full flex-col items-center justify-center overflow-auto">
            <Card
                color="lv1"
                className="flex w-md flex-col items-center justify-center gap-10 p-10">
                <Page.Header className="flex w-full flex-col items-center gap-8">
                    <SvgKodus className="h-8" />

                    <div className="flex flex-col items-center gap-2">
                        <Heading variant="h2" className="text-center">
                            Hello{" "}
                            <span className="text-primary-light">{email}</span>!
                        </Heading>

                        <div className="text-text-secondary text-center text-sm">
                            <p>Before accessing dashboard,</p>
                            <p>
                                organization admin needs to approve your
                                account.
                            </p>
                        </div>
                    </div>
                </Page.Header>

                <Link href="/sign-out" replace>
                    <Button
                        size="sm"
                        decorative
                        variant="helper"
                        leftIcon={<LogOutIcon />}>
                        Logout
                    </Button>
                </Link>
            </Card>
        </Page.Root>
    );
};

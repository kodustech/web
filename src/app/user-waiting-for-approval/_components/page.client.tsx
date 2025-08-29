"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Heading } from "@components/ui/heading";
import { SvgKodus } from "@components/ui/icons/SvgKodus";
import { Page } from "@components/ui/page";
import { useEffectOnce } from "@hooks/use-effect-once";
import { useRefreshToken } from "@hooks/use-refresh-token";
import { UserStatus } from "@services/setup/types";
import { LogOutIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { parseJwt } from "src/core/utils/helpers";

export const UserWaitingForApprovalPage = () => {
    const router = useRouter();
    const refreshTokenAction = useRefreshToken();
    const { data } = useSession();
    const email = parseJwt(data?.user.accessToken)?.payload.email;

    useEffectOnce(() => {
        const a = async () => {
            const updatedTokens = await refreshTokenAction();
            const newAcessToken = parseJwt(updatedTokens?.user.accessToken);

            if (newAcessToken?.payload.status === UserStatus.ACTIVE) {
                router.replace("/");
            }
        };

        a();
    });

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

                <Link href="/sign-out">
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

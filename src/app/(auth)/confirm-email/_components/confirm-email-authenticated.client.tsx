"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { redirect, useRouter } from "next/navigation";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Heading } from "@components/ui/heading";
import { SvgKodus } from "@components/ui/icons/SvgKodus";
import { Page } from "@components/ui/page";
import { toast } from "@components/ui/toaster/use-toast";
import { useEffectOnce } from "@hooks/use-effect-once";
import { useInterval } from "@hooks/use-interval";
import { TypedFetchError } from "@services/fetch";
import { useAuth } from "src/core/providers/auth.provider";
import { resendConfirmEmail } from "src/lib/auth/fetchers";

import { ConfirmEmailForm } from "./confirm-email-form.client";

const EMAIL_CONFIRMATION_REQUIRED_STATUSES = ["pending", "pending_email"];

const normalizeStatus = (status?: string | null) =>
    status ? String(status).toLowerCase() : undefined;

export const ConfirmEmailAuthenticatedView = () => {
    const router = useRouter();
    const { email, status, refreshAccessTokens } = useAuth();
    const [isResending, setIsResending] = useState(false);

    const ensureValidStatus = () => {
        const normalizedStatus = normalizeStatus(status);
        if (
            normalizedStatus &&
            !EMAIL_CONFIRMATION_REQUIRED_STATUSES.includes(normalizedStatus)
        ) {
            if (normalizedStatus === "awaiting_approval") {
                router.replace("/user-waiting-for-approval");
                return;
            }

            router.replace("/settings");
        }
    };

    useEffectOnce(() => {
        ensureValidStatus();
    });

    useEffect(() => {
        ensureValidStatus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status]);

    useInterval(() => {
        refreshAccessTokens()
            .then((newSession) => {
                const nextStatus = normalizeStatus(newSession?.user.status);
                if (
                    nextStatus &&
                    !EMAIL_CONFIRMATION_REQUIRED_STATUSES.includes(nextStatus)
                ) {
                    if (nextStatus === "awaiting_approval") {
                        router.replace("/user-waiting-for-approval");
                        return;
                    }

                    router.replace("/settings");
                }
            })
            .catch((error) => {
                if (
                    TypedFetchError.isError(error) &&
                    error.statusCode === 401
                ) {
                    redirect("/sign-out");
                }
            });
    }, 60000);

    const handleSuccess = async () => {
        const newSession = await refreshAccessTokens();
        const nextStatus = normalizeStatus(newSession?.user.status);

        if (!nextStatus) return;

        if (EMAIL_CONFIRMATION_REQUIRED_STATUSES.includes(nextStatus)) return;

        if (nextStatus === "awaiting_approval") {
            router.replace("/user-waiting-for-approval");
            return;
        }

        router.replace("/settings");
    };

    const handleResendEmail = async () => {
        if (!email) {
            toast({
                title: "Email unavailable",
                description:
                    "Sign out and sign back in to request another email.",
                variant: "danger",
            });
            return;
        }

        setIsResending(true);
        try {
            await resendConfirmEmail(email);
            toast({
                title: "Email resent",
                description: "We just sent you another confirmation email.",
                variant: "success",
            });
        } catch (error) {
            toast({
                title: "Error",
                description:
                    "We couldn't resend the confirmation email. Please try again.",
                variant: "danger",
            });
        } finally {
            setIsResending(false);
        }
    };

    return (
        <Page.Root className="flex h-full w-full flex-col items-center justify-center overflow-auto py-20">
            <Card
                color="lv1"
                className="flex w-md flex-col items-center justify-center gap-10 p-10">
                <Page.Header className="flex w-full flex-col items-center gap-8">
                    <SvgKodus className="h-8" />

                    <div className="flex flex-col items-center gap-2">
                        <Heading variant="h2" className="text-center">
                            Confirm your email
                        </Heading>

                        <div className="text-text-secondary text-center text-sm">
                            <p>
                                We sent a confirmation message to{" "}
                                <span className="text-primary-light">
                                    {email}
                                </span>
                                .
                            </p>
                            <p>
                                Paste the token below to finish setting up your
                                account.
                            </p>
                        </div>
                    </div>
                </Page.Header>

                <ConfirmEmailForm onSuccess={handleSuccess} />

                <Button
                    type="button"
                    variant="helper"
                    size="sm"
                    className="text-primary-light hover:text-primary mt-1 !bg-transparent underline"
                    loading={isResending}
                    onClick={handleResendEmail}>
                    Resend confirmation email
                </Button>

                <Link href="/sign-out" replace>
                    <Button
                        size="sm"
                        decorative
                        variant="helper"
                        className="mt-2">
                        Logout
                    </Button>
                </Link>
            </Card>
        </Page.Root>
    );
};

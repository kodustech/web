import { Suspense } from "react";
import { Metadata } from "next";
import { Heading } from "@components/ui/heading";
import { SvgKodus } from "@components/ui/icons/SvgKodus";
import { Link } from "@components/ui/link";
import { Page } from "@components/ui/page";

import { OAuthButtons } from "../components/oauth";
import { UserAuthForm } from "../components/user-auth-form";

export const metadata: Metadata = {
    title: "Login",
};

export default function LoginPage() {
    return (
        <Page.Root className="flex h-full w-full flex-col items-center overflow-auto py-20">
            <div className="flex w-[90%] flex-1 flex-col items-center justify-center gap-10 md:max-w-[500px]">
                <Page.Header className="flex w-full flex-col items-center gap-10">
                    <SvgKodus className="h-8" />

                    <div className="flex flex-col items-center gap-2">
                        <Heading variant="h2" className="text-center">
                            Welcome Back!
                        </Heading>

                        <p className="text-text-secondary text-center text-sm">
                            Start automating reviews in minutes and save hours
                            every sprint!
                        </p>
                    </div>
                </Page.Header>

                <Page.Content className="flex-none gap-4">
                    <Suspense>
                        <OAuthButtons />
                    </Suspense>

                    <div className="mt-4 flex w-full flex-row items-center">
                        <hr className="flex-1 border-[#6A57A433]" />
                        <p className="text-text-secondary px-6 text-[13px]">
                            Or sign in with
                        </p>
                        <hr className="flex-1 border-[#6A57A433]" />
                    </div>

                    <Suspense>
                        <UserAuthForm />
                    </Suspense>

                    <div className="mt-4 text-center text-sm">
                        Don't have an account yet?{" "}
                        <Link href="/sign-up">Sign up for free</Link>
                    </div>
                    <Link
                        className="mx-auto mt-4 text-center text-sm text-blue-400 underline"
                        href="/forgot-password">
                        Forgot Password?
                    </Link>
                </Page.Content>
            </div>
        </Page.Root>
    );
}

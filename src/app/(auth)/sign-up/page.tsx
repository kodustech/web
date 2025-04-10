import { Suspense } from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Heading } from "@components/ui/heading";
import { SvgKodus } from "@components/ui/icons/SvgKodus";
import { Page } from "@components/ui/page";
import { ScrollArea } from "@components/ui/scroll-area";

import { RegisterPageContent } from "../components/register-page-content";

export const metadata: Metadata = {
    title: "Sign Up",
};

export default function RegisterPage() {
    return (
        <Page.Root className="mx-auto flex max-h-screen flex-row overflow-hidden p-6">
            <div className="flex flex-10 flex-col justify-center gap-10 rounded-3xl bg-[#231B2E]/35 p-12 backdrop-blur-sm">
                <SvgKodus className="h-8 min-h-8" />

                <div className="flex flex-1 flex-col justify-center gap-10">
                    <Heading variant="h1" className="text-[calc(3vh)]">
                        Join thousands of teams automating code reviews with
                        Kody
                    </Heading>

                    <div className="overflow-hidden rounded-3xl">
                        <video
                            loop
                            muted
                            autoPlay
                            playsInline
                            disablePictureInPicture
                            className="h-full w-full object-contain"
                            src="/assets/videos/setup/presentation.webm"
                        />
                    </div>

                    <div className="flex flex-col items-end">
                        <p className="text-base font-bold">
                            It only takes 2 minutes to set up!
                        </p>

                        <p className="text-sm text-muted-foreground">
                            Yes, we timed it.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex flex-14 flex-col justify-center overflow-auto">
                <ScrollArea type="auto">
                    <div className="flex flex-col items-center gap-10 py-10">
                        <Suspense>
                            <div className="max-w-96">
                                <RegisterPageContent />
                            </div>
                        </Suspense>

                        <div className="text-center text-[13px] text-muted-foreground">
                            Already have an account?{" "}
                            <Link href="/sign-in">
                                <span className="whitespace-nowrap font-medium text-brand-orange! underline underline-offset-4">
                                    Log in
                                </span>
                            </Link>
                        </div>
                    </div>
                </ScrollArea>
            </div>
        </Page.Root>
    );
}

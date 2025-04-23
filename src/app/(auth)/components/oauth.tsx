"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@components/ui/button";
import { SvgGithub } from "@components/ui/icons/SvgGithub";
import { SvgGitlab } from "@components/ui/icons/SvgGitlab";
import { signIn } from "next-auth/react";
import { AuthProviders } from "src/lib/auth/types";

export const OAuthButtons = ({ isSignUp = false }: { isSignUp?: boolean }) => {
    const searchParams = useSearchParams();
    let callbackUrl = searchParams.get("callbackUrl");
    if (isSignUp) callbackUrl = "/setup";

    const handleProviderLogin = async (provider: AuthProviders) => {
        await signIn(provider, {
            redirect: true,
            redirectTo: callbackUrl ?? "/setup",
        });
    };

    return (
        <div className="flex flex-col gap-3">
            {/* <Button variant="outline" className="w-1/3" onClick={() => handleProviderLogin(AuthProviders.GOOGLE)}>
                <SvgGoogle className="h-full" />
                    Google
                </Button> */}

            <Button
                size="lg"
                variant="helper"
                className="w-full"
                onClick={() => handleProviderLogin(AuthProviders.GITHUB)}
                leftIcon={<SvgGithub />}>
                Sign {isSignUp ? "up" : "in"} with Github
            </Button>

            <Button
                size="lg"
                variant="helper"
                className="w-full"
                onClick={() => handleProviderLogin(AuthProviders.GITLAB)}
                leftIcon={<SvgGitlab />}>
                Sign {isSignUp ? "up" : "in"} with Gitlab
            </Button>
        </div>
    );
};

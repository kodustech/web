"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { deleteCookie, getCookie } from "cookies-next";
import { signIn } from "next-auth/react";

export default function SsoCallbackPage() {
    const router = useRouter();

    useEffect(() => {
        const domain =
            process.env.WEB_NODE_ENV === "production" ? ".kodus.io" : undefined;

        const handoffCookie = getCookie("sso_handoff", { domain });
        deleteCookie("sso_handoff", { domain });

        console.log("SSO handoff cookie:", handoffCookie);
        console.log("SSO handoff cookie domain:", domain);
        console.log("SSO handoff cookie type:", typeof handoffCookie);

        if (handoffCookie) {
            try {
                const tokens = JSON.parse(handoffCookie as string);

                signIn("sso", {
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                    redirect: true,
                    redirectTo: "/",
                });
            } catch (e) {
                console.error("Failed to parse SSO cookie");
                router.push("/sign-out");
            }
        } else {
            console.error("No SSO handoff cookie found");
            router.push("/sign-out");
        }
    }, [router]);

    return (
        <div className="flex h-screen items-center justify-center">
            <div className="text-center">
                <h2 className="text-xl font-semibold">Authenticating...</h2>
                <p className="text-gray-500">
                    Please wait while we log you in.
                </p>
            </div>
        </div>
    );
}

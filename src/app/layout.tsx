import Script from "next/script";
import { OptinMonsterRouteChangeListener } from "@components/system/optinmonster-route-change-listener";
import { MagicModalPortal } from "@components/ui/magic-modal";
import { Toaster } from "@components/ui/toaster/toaster";
import { TooltipProvider } from "@components/ui/tooltip";
import { GoogleTagManager } from "@next/third-parties/google";
import QueryProvider from "src/core/providers/query.provider";
import { ThemeProvider } from "src/core/providers/theme.provider";

import background from "../core/components/ui/backgrounds/background.svg";

import "./globals.css";

export const metadata = {
    title: {
        default: "Kodus AI",
        template: "%s | Kodus AI",
    },
    icons: {
        icon: "/favicon.ico",
        shortcut: "/favicon-16x16.png",
    },
};

export default function RootLayout({ children }: React.PropsWithChildren) {
    return (
        <html lang="en" className="dark" style={{ colorScheme: "dark" }}>
            <GoogleTagManager gtmId="GTM-KN2J57G" />

            <body
                className="flex flex-col bg-cover bg-fixed bg-bottom bg-no-repeat"
                style={{ backgroundImage: `url(${background.src})` }}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem>
                    <TooltipProvider delayDuration={0}>
                        <QueryProvider>
                            <TooltipProvider>{children}</TooltipProvider>

                            <MagicModalPortal />
                            <Toaster />
                        </QueryProvider>
                    </TooltipProvider>
                </ThemeProvider>

                <Script
                    async
                    id="optinmonster"
                    type="text/javascript"
                    data-user="340940"
                    data-account="360754"
                    src="https://a.omappapi.com/app/js/api.min.js"
                />

                <OptinMonsterRouteChangeListener />
            </body>
        </html>
    );
}

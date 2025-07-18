import type { Metadata } from "next";
import { DM_Sans, Overpass_Mono } from "next/font/google";
import Script from "next/script";
import { OptinMonsterRouteChangeListener } from "@components/system/optinmonster-route-change-listener";
import { MagicModalPortal } from "@components/ui/magic-modal";
import { Toaster } from "@components/ui/toaster/toaster";
import { TooltipProvider } from "@components/ui/tooltip";
import { GoogleTagManager } from "@next/third-parties/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import QueryProvider from "src/core/providers/query.provider";
import { ThemeProvider } from "src/core/providers/theme.provider";
import { cn } from "src/core/utils/components";

import "./globals.css";

const dm_sans = DM_Sans({
    subsets: ["latin"],
    preload: true,
});
const overpass_mono = Overpass_Mono({
    subsets: ["latin"],
    preload: true,
});

export const metadata: Metadata = {
    title: {
        default: "Kodus",
        template: "%s | Kodus",
    },
    icons: { icon: "/favicon.ico" },
    openGraph: {
        locale: "en_US",
        type: "website",
        siteName: "Kodus",
        title: {
            default: "Kodus",
            template: "%s | Kodus",
        },
    },
};

export default function RootLayout({ children }: React.PropsWithChildren) {
    return (
        <html lang="en" className="dark" style={{ colorScheme: "dark" }}>
            <GoogleTagManager gtmId="GTM-KN2J57G" />

            <body
                className={cn(
                    "bg-background text-text-primary flex h-screen w-screen flex-col overflow-hidden",
                    overpass_mono.className,
                    dm_sans.className,
                )}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem>
                    <TooltipProvider delayDuration={0} skipDelayDuration={0}>
                        <QueryProvider>
                            <NuqsAdapter>
                                {children}
                                <MagicModalPortal />
                                <Toaster />
                            </NuqsAdapter>
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

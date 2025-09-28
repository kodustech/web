import { NextResponse } from "next/server";
import { UserStatus } from "@enums";

import { auth } from "./core/config/auth";
import { CURRENT_PATH_HEADER } from "./core/utils/headers";
import { handleAuthenticated } from "./core/utils/permissions";

// Rotas públicas que não precisam de autenticação
const publicPaths = [
    "/api/health",
    "/api/webhooks",
    "/api/play",
    "/favicon.ico",
    "/api/auth/callback",
    "/api/auth/csrf",
    "/api/auth/signout",
    "/api/auth/session",
    "/ingest/e",
    "/ingest/decide",
    "/github-integration",
    "/sign-out",
];

// Rotas de autenticação
const authPaths = [
    "/sign-in",
    "/sign-up",
    "/forgot-password",
    "/confirm-email",
    "/create-new-password",
    "/invite",
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/forgot-password",
    "/api/auth/confirm-email",
    "/api/auth/create-new-password",
    "/api/auth",
];

export default auth(async (req) => {
    const pathname = req.nextUrl.pathname;

    if (pathname === "/register") {
        return NextResponse.redirect(new URL("/sign-up", req.url));
    }

    if (pathname === "/login") {
        return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    // add a new header which can be used on Server Components
    const headers = new Headers(req.headers);
    headers.set(CURRENT_PATH_HEADER, pathname);

    const next = NextResponse.next({ request: { headers } });

    const session = req.auth;
    const isAuthenticated = !!session;

    // If the token was updated just now during middleware execution,
    // a redirect is performed so that server components receive the new cookies.
    // `next-auth 5.0.0-beta.29` cannot send cookies using NextResponse.next()
    if (session?.user.reason === "expired-token") {
        return NextResponse.redirect(new URL(pathname, req.url));
    }

    // Allows access to public routes
    if (publicPaths.some((path) => pathname.startsWith(path))) return next;

    // If the user is not authenticated
    if (!isAuthenticated) {
        // Trying to access a protected route, it redirects to login
        if (!authPaths.some((path) => pathname.startsWith(path))) {
            return NextResponse.redirect(new URL("/sign-in", req.url));
        }

        // If it is a public route, allow access
        return next;
    }

    const isConfirmEmailPath = pathname.startsWith("/confirm-email");
    const normalizedStatus = session.user.status
        ? String(session.user.status).toLowerCase()
        : undefined;
    const requiresEmailConfirmation = ["pending", "pending_email"].includes(
        normalizedStatus ?? "",
    );

    if (requiresEmailConfirmation) {
        if (!isConfirmEmailPath) {
            return NextResponse.redirect(new URL("/confirm-email", req.url), {
                status: 302,
            });
        }

        return next;
    }

    // if user is waiting for approval, allow access to this page only
    if (
        normalizedStatus === UserStatus.AWAITING_APPROVAL &&
        pathname !== "/user-waiting-for-approval"
    ) {
        return NextResponse.redirect(
            new URL("/user-waiting-for-approval", req.url),
        );
    }

    // If you are on an authentication route and are already authenticated, redirect to /settings
    if (authPaths.some((path) => pathname.startsWith(path))) {
        return NextResponse.redirect(new URL("/settings", req.url), {
            status: 302,
        });
    }

    return handleAuthenticated(req, pathname, session, next);
});

export const config = {
    matcher: [
        "/((?!api/webhooks|api/play|_next|assets|favicon.ico|api/health).*)",
    ],
};

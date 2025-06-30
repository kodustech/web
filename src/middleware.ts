import { NextRequest, NextResponse } from "next/server";

import { auth } from "./core/config/auth";
import { CURRENT_PATH_HEADER } from "./core/utils/headers";
import { parseJwt } from "./core/utils/helpers";
import { handleAuthenticated, Role, TeamRole } from "./core/utils/permissions";

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
    "/create-new-password",
    "/invite",
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/forgot-password",
    "/api/auth/create-new-password",
    "/api/auth",
];

export default async function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname;

    // Log inicial de todas as requisições
    console.log("🚀 Middleware Entry:", {
        method: req.method,
        pathname,
        url: req.url,
        searchParams: Object.fromEntries(req.nextUrl.searchParams.entries()),
        headers: Object.fromEntries(req.headers.entries()),
        userAgent: req.headers.get("user-agent"),
        referer: req.headers.get("referer"),
    });

    // Add a new header which can be used on Server Components
    const headers = new Headers(req.headers);
    headers.set(CURRENT_PATH_HEADER, pathname);

    if (pathname === "/register") {
        console.log("🔄 Redirecting /register to /sign-up");
        return NextResponse.redirect(new URL("/sign-up", req.url));
    }

    if (pathname === "/login") {
        console.log("🔄 Redirecting /login to /sign-in");
        return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    // Permite acesso a rotas públicas
    if (publicPaths.some((path) => pathname.startsWith(path))) {
        console.log("✅ Public path allowed:", pathname);
        return NextResponse.next({ request: { headers } });
    }

    console.log("🔐 Checking authentication...");
    const token = await auth();
    const isAuthenticated = !!token;

    console.log("🔐 Auth result:", {
        isAuthenticated,
        hasToken: !!token,
        tokenType: token ? typeof token : "none",
    });

    // Se o usuário não estiver autenticado
    if (!isAuthenticated) {
        console.log("❌ User not authenticated");
        // Se tentar acessar uma rota protegida, redireciona para login
        if (!authPaths.some((path) => pathname.startsWith(path))) {
            console.log("🔄 Redirecting unauthenticated user to /sign-in");
            return NextResponse.redirect(new URL("/sign-in", req.url));
        }
        console.log("✅ Auth path allowed for unauthenticated user");
        return NextResponse.next({ request: { headers } });
    }

    const accessToken = token?.user?.accessToken;

    console.log("🔑 Access token check:", {
        hasAccessToken: !!accessToken,
        tokenLength: accessToken?.length || 0,
    });

    // Se não tiver token de acesso, faz logout
    if (!accessToken) {
        console.log("🔄 No access token, redirecting to /sign-out");
        return NextResponse.redirect(new URL("/sign-out", req.url));
    }

    const parsedToken = parseJwt(accessToken);

    console.log("🔑 Token parsing:", {
        hasParsedToken: !!parsedToken,
        hasPayload: !!parsedToken?.payload,
        role: parsedToken?.payload?.role,
        teamRole: parsedToken?.payload?.teamRole,
    });

    // Se o token não puder ser parseado, faz logout
    if (!parsedToken?.payload) {
        console.log("🔄 Invalid token, redirecting to /sign-out");
        return NextResponse.redirect(new URL("/sign-out", req.url));
    }

    // Dados do usuário autenticado
    const userRole = (parsedToken.payload.role as Role) || Role.USER;
    const userTeamRole =
        (parsedToken.payload.teamRole as TeamRole) || TeamRole.MEMBER;

    console.log("👤 User roles:", {
        userRole,
        userTeamRole,
        pathname,
    });

    // Se o usuário está autenticado, verifica permissões
    console.log("🔍 Calling handleAuthenticated...");
    return handleAuthenticated(
        req,
        pathname,
        userRole,
        userTeamRole,
        authPaths,
        headers,
    );
}

export const config = {
    matcher: [
        "/((?!api/webhooks|api/play|_next|assets|favicon.ico|api/health).*)",
    ],
};

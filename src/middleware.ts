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

    // Add a new header which can be used on Server Components
    const headers = new Headers(req.headers);
    headers.set(CURRENT_PATH_HEADER, pathname);

    if (pathname === "/register")
        return NextResponse.redirect(new URL("/sign-up", req.url));

    if (pathname === "/login")
        return NextResponse.redirect(new URL("/sign-in", req.url));

    // Permite acesso a rotas públicas
    if (publicPaths.some((path) => pathname.startsWith(path))) {
        return NextResponse.next({ request: { headers } });
    }

    const token = await auth();
    const isAuthenticated = !!token;

    // Se o usuário não estiver autenticado
    if (!isAuthenticated) {
        // Se tentar acessar uma rota protegida, redireciona para login
        if (!authPaths.some((path) => pathname.startsWith(path))) {
            return NextResponse.redirect(new URL("/sign-in", req.url));
        }
        return NextResponse.next({ request: { headers } });
    }

    const accessToken = token?.user?.accessToken;

    // Se não tiver token de acesso, faz logout
    if (!accessToken) {
        return NextResponse.redirect(new URL("/sign-out", req.url));
    }

    const parsedToken = parseJwt(accessToken);

    // Se o token não puder ser parseado, faz logout
    if (!parsedToken?.payload) {
        return NextResponse.redirect(new URL("/sign-out", req.url));
    }

    // Dados do usuário autenticado
    const userRole = (parsedToken.payload.role as Role) || Role.USER;
    const userTeamRole =
        (parsedToken.payload.teamRole as TeamRole) || TeamRole.MEMBER;

    // Se o usuário está autenticado, verifica permissões
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

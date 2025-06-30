import { NextRequest, NextResponse } from "next/server";

// permissions.ts
export enum Role {
    OWNER = "owner",
    USER = "user",
}

export enum TeamRole {
    TEAM_LEADER = "team_leader",
    MEMBER = "team_member",
}

const permissions = {
    routes: {
        [Role.OWNER]: ["*"],
        [TeamRole.MEMBER]: [
            "/cockpit",
            "/chat",
            "/chat/:id",
            "/sign-out",
            "/settings/subscription",
            "/issues",
        ],
        [TeamRole.TEAM_LEADER]: [
            "/teams",
            "/teams/:teamId",
            "/cockpit",
            "/automations",
            "/settings/subscription",
            "/setup/jira/configuration",
            "/teams/:teamId/jira/configuration",
            "/setup/slack/configuration",
            "/teams/:teamId/slack/configuration",
            "/setup/teams/configuration",
            "/teams/:teamId/teams/configuration",
            "/setup/github/configuration",
            "/setup/gitlab/configuration",
            "/teams/:teamId/gitlab/configuration",
            "/teams/:teamId/github/configuration",
            "/setup/jira/configuration/select-columns",
            "/teams/:teamId/jira/configuration/select-columns",
            "/setup/azure-boards/configuration/select-columns",
            "/setup/azure-boards/configuration",
            "/teams/:teamId/azure-boards/configuration",
            "/setup/discord/configuration",
            "/teams/:teamId/discord/configuration",
            "/teams/:teamId/integrations",
            "/teams/:teamId/general",
            "/teams/:teamId/kody",
            "/teams/:teamId/team-members",
            "/teams/:teamId/members",
            "/teams/:teamId/code-management",
            "/teams/:teamId/artifacts",
            "/teams/:teamId/project-management",
            "/teams/parameters/:teamId",
            "/chat",
            "/chat/:id",
            "/sign-out",
            "/library/kody-rules",
            "/issues",
        ],
    },
    components: {
        [Role.OWNER]: ["AdminPanel", "SettingsPanel"],
        [TeamRole.MEMBER]: ["TeamMemberCookpit"],
        [TeamRole.TEAM_LEADER]: ["TeamLeaderCookpit", "TeamMemberCookpit"],
    },
};

const canAccessRoute = (
    role: Role,
    teamRole: TeamRole,
    pathname: string,
): boolean => {
    // Se for owner, tem acesso a tudo
    if (role === Role.OWNER) {
        return true;
    }

    // Pega as rotas permitidas para o papel do usuário na equipe
    const teamRolePaths: string[] = permissions.routes[teamRole] || [];

    // Verifica se o pathname corresponde a alguma rota permitida
    const hasAccess = teamRolePaths.some((route) => {
        // Se a rota for exata (sem parâmetros)
        if (!route.includes(":")) {
            const matches =
                pathname === route || pathname.startsWith(route + "/");
            // Verifica se o pathname é igual à rota ou começa com a rota seguido de "/"
            return matches;
        }

        // Converte a rota em um padrão regex
        const createRoutePattern = (route: string): string => {
            return route
                .replace(/[.*+?^${}()|[]\]/g, "\$&")
                .replace(/:teamId/g, "[\w-]+")
                .replace(/:[a-zA-Z]+/g, "[\w-]+");
        };

        // In canAccessRoute:
        const pattern = createRoutePattern(route);

        // Permite que o pathname tenha caracteres adicionais após o padrão
        const regex = new RegExp(`^${pattern}(?:/.*)?$`);
        const matches = regex.test(pathname);
        return matches;
    });

    return hasAccess;
};

export function handleAuthenticated(
    req: NextRequest,
    pathname: string,
    userRole: Role,
    userTeamRole: TeamRole,
    authPaths: string[],
    headers: Headers,
) {
    // Detecta requisições RSC (React Server Components) de múltiplas formas
    const isRSCRequest =
        req.nextUrl.searchParams.has("_rsc") ||
        req.headers.get("rsc") === "1" ||
        req.headers.get("next-router-prefetch") === "1" ||
        req.headers.get("next-router-state-tree") !== null;

    // Redireciona a raiz "/" para "/cockpit" (apenas se não for RSC)
    if ((pathname === "/" || pathname === "") && !isRSCRequest) {
        return NextResponse.redirect(new URL("/cockpit", req.url), {
            status: 302,
        });
    }

    // Se for RSC request na raiz, permite passar
    if ((pathname === "/" || pathname === "") && isRSCRequest) {
        return NextResponse.next({ request: { headers } });
    }

    // Se estiver em uma rota de autenticação e já estiver autenticado, redireciona para /cockpit
    if (authPaths.some((path) => pathname.startsWith(path))) {
        return NextResponse.redirect(new URL("/cockpit", req.url), {
            status: 302,
        });
    }

    if (pathname.startsWith("/chat")) {
        return NextResponse.redirect(new URL("/cockpit", req.url), {
            status: 302,
        });
    }

    // Se o usuário não tiver permissão, bloqueia o acesso
    if (!canAccessRoute(userRole, userTeamRole, pathname)) {
        const referer = req.headers.get("referer");
        // Use URL relativa para evitar problemas com localhost
        const redirectUrl = referer ? new URL(referer) : new URL("/", req.url);
        return NextResponse.redirect(redirectUrl);
    }

    // Permite acesso à rota
    return NextResponse.next({ request: { headers } });
}

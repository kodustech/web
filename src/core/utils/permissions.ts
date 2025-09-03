import { NextRequest, NextResponse } from "next/server";
import { TeamRole, UserRole } from "@enums";
import type { Session } from "next-auth";

const permissions = {
    routes: {
        [UserRole.OWNER]: ["*"],
        [TeamRole.TEAM_MEMBER]: [
            "/cockpit",
            "/chat",
            "/chat/:id",
            "/settings/subscription",
            "/issues",
            "/user-waiting-for-approval",
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
            "/library/kody-rules",
            "/issues",
            "/user-waiting-for-approval",
        ],
    },
    components: {
        [UserRole.OWNER]: ["AdminPanel", "SettingsPanel"],
        [TeamRole.TEAM_MEMBER]: ["TeamMemberCookpit"],
        [TeamRole.TEAM_LEADER]: ["TeamLeaderCookpit", "TeamMemberCookpit"],
    },
};

const canAccessRoute = ({
    pathname,
    role,
    teamRole,
}: {
    role: UserRole;
    teamRole: TeamRole;
    pathname: string;
}): boolean => {
    // Se for owner, tem acesso a tudo
    if (role === UserRole.OWNER) return true;

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
    session: Session,
    next: NextResponse,
) {
    // Detects RSC (React Server Components) requests in multiple ways
    const isRSCRequest =
        req.nextUrl.searchParams.has("_rsc") ||
        req.headers.get("rsc") === "1" ||
        req.headers.get("next-router-prefetch") === "1" ||
        req.headers.get("next-router-state-tree") !== null;

    // Redirect root "/" to "/cockpit" (only if not RSC)
    if ((pathname === "/" || pathname === "") && !isRSCRequest) {
        return NextResponse.redirect(new URL("/cockpit", req.url), {
            status: 302,
        });
    }

    // If it is RSC request in root, it allows to pass
    if ((pathname === "/" || pathname === "") && isRSCRequest) return next;

    // If the user does not have permission, block access
    if (
        !canAccessRoute({
            pathname,
            role: session.user.role,
            teamRole: session.user.teamRole,
        })
    ) {
        const referer = req.headers.get("referer");
        // Use URL relativa para evitar problemas com localhost
        const redirectUrl = referer ? new URL(referer) : new URL("/", req.url);
        return NextResponse.redirect(redirectUrl);
    }

    // Allows access to the route
    return next;
}

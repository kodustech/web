import type { ComponentProps, SVGProps } from "react";
import { Badge } from "@components/ui/badge";
import { Heading } from "@components/ui/heading";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@components/ui/hover-card";
import { SvgAsana } from "@components/ui/icons/SvgAsana";
import { SvgDatadog } from "@components/ui/icons/SvgDatadog";
import { SvgExa } from "@components/ui/icons/SvgExa";
import { SvgGithub } from "@components/ui/icons/SvgGithub";
import { SvgGrafana } from "@components/ui/icons/SvgGrafana";
import { SvgJira } from "@components/ui/icons/SvgJira";
import { SvgLinear } from "@components/ui/icons/SvgLinear";
import { SvgPerplexity } from "@components/ui/icons/SvgPerplexity";
import { SvgSentry } from "@components/ui/icons/SvgSentry";
import { SvgSlack } from "@components/ui/icons/SvgSlack";
import { cn } from "src/core/utils/components";

const normalizeProviderKey = (value: string) =>
    value.trim().toLowerCase().replace(/\s+/g, "");

const getProviderInitials = (value: string) => {
    const parts = value.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const PROVIDER_ICON_MAP: Record<
    string,
    (props: SVGProps<SVGSVGElement>) => JSX.Element
> = {
    "slack": SvgSlack,
    "jira": SvgJira,
    "datadog": SvgDatadog,
    "linear": SvgLinear,
    "asana": SvgAsana,
    "grafana": SvgGrafana,
    "perplexity": SvgPerplexity,
    "exa": SvgExa,
    "github": SvgGithub,
    "sentry": SvgSentry,
    "sentryio": SvgSentry,
    "sentry.io": SvgSentry,
};

const McpProviderLogo = ({ provider }: { provider: string }) => {
    const key = normalizeProviderKey(provider);
    const Icon = PROVIDER_ICON_MAP[key];

    return (
        <span className="bg-card-lv3 border-card-lv3 flex size-5 items-center justify-center rounded-full border">
            {Icon ? (
                <Icon className="size-3.5" />
            ) : (
                <span className="text-text-secondary text-[9px] font-semibold">
                    {getProviderInitials(provider)}
                </span>
            )}
        </span>
    );
};

export const McpProvidersBadge = ({
    providers,
    maxVisible = 5,
    badgeVariant = "secondary",
    className,
    hoverTitle = "Requires MCP providers",
    hoverDescription,
}: {
    providers?: string[];
    maxVisible?: number;
    badgeVariant?: ComponentProps<typeof Badge>["variant"];
    className?: string;
    hoverTitle?: string;
    hoverDescription?: string;
}) => {
    const normalizedProviders = Array.isArray(providers)
        ? providers.filter(Boolean)
        : [];

    if (normalizedProviders.length === 0) return null;

    const visibleProviders = normalizedProviders.slice(0, maxVisible);
    const remaining = normalizedProviders.length - visibleProviders.length;

    return (
        <HoverCard openDelay={150}>
            <HoverCardTrigger asChild>
                <div
                    className={cn(
                        "flex cursor-default items-center gap-1",
                        className,
                    )}>
                    <span className="text-text-secondary mr-2 text-sm">
                        Required Plugins:
                    </span>
                    <div className="flex -space-x-1">
                        {visibleProviders.map((provider) => (
                            <McpProviderLogo
                                key={provider}
                                provider={provider}
                            />
                        ))}
                        {remaining > 0 && (
                            <span className="bg-card-lv3 border-card-lv3 text-text-secondary flex size-5 items-center justify-center rounded-full border text-[9px] font-semibold">
                                +{remaining}
                            </span>
                        )}
                    </div>
                </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
                <div className="space-y-1">
                    <Heading variant="h3">{hoverTitle}</Heading>
                    <p className="text-text-secondary text-sm">
                        {hoverDescription ?? normalizedProviders.join(", ")}
                    </p>
                </div>
            </HoverCardContent>
        </HoverCard>
    );
};

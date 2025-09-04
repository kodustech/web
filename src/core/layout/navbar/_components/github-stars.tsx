import { useState } from "react";
import { Button } from "@components/ui/button";
import { SvgGithub } from "@components/ui/icons/SvgGithub";
import { Link } from "@components/ui/link";
import { typedFetch } from "@services/fetch";
import { useSuspenseQuery } from "@tanstack/react-query";
import { XIcon } from "lucide-react";
import { cn } from "src/core/utils/components";

const repository = "kodustech/kodus-ai";
const repositoryUrl = `https://github.com/${repository}`;
const localStorageKey = "hide-github-stars-on-navbar";

export const GithubStars = () => {
    const [visible, setVisible] = useState(
        localStorage.getItem(localStorageKey) !== "true",
    );

    const data = useSuspenseQuery({
        queryKey: ["github-project-repository-data"],
        queryFn: async ({ signal }) => {
            return typedFetch<{ stargazers_count: number }>(
                `https://api.github.com/repos/${repository}`,
                { signal },
            );
        },
    });

    if (!visible) return;

    return (
        <div className={cn("group relative flex gap-px")}>
            <div className="absolute -top-2 -right-1 z-1 hidden group-hover:block">
                <Button
                    size="icon-xs"
                    variant="tertiary"
                    className="size-4 [--icon-size:calc(var(--spacing)*3)]"
                    onClick={() => {
                        localStorage.setItem(localStorageKey, "true");
                        setVisible(false);
                    }}>
                    <XIcon />
                </Button>
            </div>

            <Link target="_blank" href={repositoryUrl}>
                <Button
                    decorative
                    size="sm"
                    variant="helper"
                    className="rounded-r-none"
                    leftIcon={<SvgGithub />}>
                    Star
                </Button>
            </Link>

            <Link target="_blank" href={`${repositoryUrl}/stargazers`}>
                <Button
                    active
                    decorative
                    size="sm"
                    variant="helper"
                    className={cn(
                        "button-focused:text-primary-light",
                        "button-hover:text-primary-light",
                        "rounded-l-none",
                    )}>
                    {data.data.stargazers_count}
                </Button>
            </Link>
        </div>
    );
};

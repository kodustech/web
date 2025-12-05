"use client";

import dynamic from "next/dynamic";
import { Spinner } from "@components/ui/spinner";

const NoSSRGithubStars = dynamic(
    () =>
        import("src/core/layout/navbar/_components/github-stars").then(
            (f) => f.GithubStars,
        ),
    {
        ssr: false,
        loading: () => <Spinner className="h-4 w-4" />,
    },
);

export const SetupGithubStars = () => {
    return <NoSSRGithubStars />;
};

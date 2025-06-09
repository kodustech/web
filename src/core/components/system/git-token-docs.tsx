import { Link } from "@components/ui/link";
import { HelpCircle } from "lucide-react";

const DOCS_LINKS = {
    github: process.env.WEB_TOKEN_DOCS_GITHUB,
    gitlab: process.env.WEB_TOKEN_DOCS_GITLAB,
    bitbucket: process.env.WEB_TOKEN_DOCS_BITBUCKET,
    azure_repos: process.env.WEB_TOKEN_DOCS_AZUREREPOS,
} as const;

export const GitTokenDocs = (props: { provider: keyof typeof DOCS_LINKS }) => {
    const link = DOCS_LINKS[props.provider];
    if (!link) return;

    return (
        <div className="mt-4 flex flex-col gap-6">
            <div className="flex flex-row items-center gap-3 text-xs">
                <HelpCircle className="text-alert" />

                <p className="flex flex-col gap-0.5">
                    <span>Questions about configuring the access token?</span>
                    <Link href={link} target="_blank" className="text-xs">
                        Check our documentation
                    </Link>
                </p>
            </div>
        </div>
    );
};

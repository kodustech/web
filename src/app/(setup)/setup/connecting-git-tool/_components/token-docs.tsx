import { Link } from "@components/ui/link";
import { HelpCircle } from "lucide-react";

export const TokenDocs = (props: { link: string }) => {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-row items-center gap-3 text-xs">
                <HelpCircle className="text-text-secondary" />

                <p className="flex flex-col gap-1">
                    <span>Questions about configuring the access token?</span>
                    <Link
                        href={props.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs">
                        Check our documentation
                    </Link>
                </p>
            </div>
        </div>
    );
};

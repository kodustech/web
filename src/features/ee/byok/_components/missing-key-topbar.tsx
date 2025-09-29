import { Link } from "@components/ui/link";
import { ArrowRightIcon } from "lucide-react";

export const BYOKMissingKeyTopbar = () => {
    return (
        <div className="bg-warning/30 py-2 text-center text-sm">
            Active subscription plan is BYOK-based, but key was not set.
            <Link href="/organization/byok" className="mx-2 font-bold">
                Set LLM keys
                <ArrowRightIcon className="ml-1 inline size-5" />
            </Link>
        </div>
    );
};

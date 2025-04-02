import { Metadata } from "next";
import { Link } from "@components/ui/link";

export const metadata: Metadata = {
    title: "Error",
};

export default function ErrorPage() {
    return (
        <div className="flex flex-col gap-6 text-center text-sm text-muted-foreground">
            <p>It seems there's been an error.</p>

            <Link href="/">Return to login</Link>
        </div>
    );
}

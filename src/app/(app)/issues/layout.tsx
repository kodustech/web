import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Issues",
    openGraph: { title: "Issues" },
};

export default function IssuesLayout(props: { children: React.ReactNode }) {
    return props.children;
}

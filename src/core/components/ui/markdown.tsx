import "highlight.js/styles/github-dark.css";

import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { cn } from "src/core/utils/components";

type Props = {
    children: string | null | undefined;
    className?: string;
};

export const Markdown = (props: Props) => (
    <div
        className={cn(
            "[&_ol]:my-6 [&_ol]:flex [&_ol]:flex-col [&_ol]:gap-2 [&_ol_p]:text-muted-foreground [&_ol_strong]:text-foreground",
            props.className,
        )}>
        <ReactMarkdown
            rehypePlugins={[rehypeHighlight]}
            remarkPlugins={[remarkGfm]}
            remarkRehypeOptions={{ allowDangerousHtml: true }}>
            {props.children}
        </ReactMarkdown>
    </div>
);

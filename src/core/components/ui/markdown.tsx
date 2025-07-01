import "highlight.js/styles/github-dark.css";

import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { cn } from "src/core/utils/components";

import { Link } from "./link";

type Props = {
    children: string | null | undefined;
    className?: string;
};

export const Markdown = (props: Props) => (
    <div
        className={cn(
            "flex flex-col gap-3",
            "[&_ol_p]:text-text-secondary [&_ol_strong]:text-text-primary [&_ol]:my-6 [&_ol]:flex [&_ol]:flex-col [&_ol]:gap-2",
            props.className,
        )}>
        <ReactMarkdown
            rehypePlugins={[rehypeHighlight]}
            remarkPlugins={[remarkGfm]}
            components={{
                code: (props) => (
                    <code
                        {...props}
                        className={cn(
                            "bg-card-lv2 text-text-primary rounded-lg px-1 py-0.5 leading-0 whitespace-break-spaces",
                            props.className,
                        )}
                    />
                ),
                p: (props) => (
                    <p
                        {...props}
                        className={cn("leading-relaxed", props.className)}
                    />
                ),
                a: (props) => (
                    <Link
                        {...props}
                        target="_blank"
                        href={
                            props.href as React.ComponentProps<
                                typeof Link
                            >["href"]
                        }
                    />
                ),
            }}
            remarkRehypeOptions={{ allowDangerousHtml: true }}>
            {props.children}
        </ReactMarkdown>
    </div>
);

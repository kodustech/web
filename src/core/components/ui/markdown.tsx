import "highlight.js/styles/github-dark.css";

import MarkdownToJSX from "markdown-to-jsx";
import { cn } from "src/core/utils/components";

import { Heading } from "./heading";
import { Link } from "./link";
import { Separator } from "./separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "./table";

type Props = {
    children: string | null | undefined;
    options?: React.ComponentProps<typeof MarkdownToJSX>["options"];
    className?: React.ComponentProps<typeof MarkdownToJSX>["className"];
};

export const Markdown = (props: Props) => {
    if (!props.children?.trim().length) return null;

    return (
        <MarkdownToJSX
            className={cn("text-sm", props.className)}
            options={{
                ...props.options,
                overrides: {
                    iframe: () => null,
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
                        <span
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
                    ul: ({ children }) => (
                        <ul className="list-disc pl-4.5">{children}</ul>
                    ),
                    h1: ({ children }) => (
                        <Heading variant="h1">{children}</Heading>
                    ),
                    h2: ({ children }) => (
                        <Heading variant="h2">{children}</Heading>
                    ),
                    h3: ({ children }) => (
                        <Heading variant="h3">{children}</Heading>
                    ),
                    hr: () => <Separator />,
                    table: ({ children }) => <Table>{children}</Table>,
                    th: ({ children }) => <TableHead>{children}</TableHead>,
                    thead: ({ children }) => (
                        <TableHeader>{children}</TableHeader>
                    ),
                    tbody: ({ children }) => <TableBody>{children}</TableBody>,
                    td: ({ children }) => <TableCell>{children}</TableCell>,
                    tr: ({ children }) => <TableRow>{children}</TableRow>,
                    ...props.options?.overrides,
                },
            }}>
            {props.children}
        </MarkdownToJSX>
    );
};

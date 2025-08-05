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
            className={cn(
                "text-text-secondary text-sm",
                "*:first-child:mt-0 *:mb-4 [&_li>span]:mt-4 [&_li>ul]:mt-2 [&_summary]:cursor-pointer",
                "[&_blockquote]:mb-4 [&_details]:mb-4 [&_dl]:mb-4 [&_ol]:mb-4 [&_pre]:mb-4 [&_span]:mb-4 [&_table]:mb-4 [&_ul]:mb-4",
                "[&_ul]:list-disc [&_ul]:space-y-2.5 [&_ul]:pl-4.5",

                "[&_summary]:text-text-primary [&_strong]:text-text-primary [&_th]:text-text-primary",

                "[&_code]:bg-background [&_code]:text-text-primary [&_code]:rounded-md [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-sans [&_code]:leading-0 [&_code]:whitespace-break-spaces",

                props.className,
            )}
            options={{
                ...props.options,
                overrides: {
                    iframe: () => null,
                    p: (props) => (
                        <span
                            {...props}
                            className={cn(
                                "block leading-relaxed",
                                props.className,
                            )}
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
                    h1: ({ children }) => (
                        <Heading variant="h1" className="border-b pb-2">
                            {children}
                        </Heading>
                    ),
                    h2: ({ children }) => (
                        <Heading variant="h2">{children}</Heading>
                    ),
                    h3: ({ children }) => (
                        <Heading variant="h3">{children}</Heading>
                    ),
                    hr: () => <Separator className="my-4" />,
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

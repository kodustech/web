import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import type { ProgrammingLanguage } from "src/core/enums/programming-language";
import type { LiteralUnion } from "src/core/types";
import { cn } from "src/core/utils/components";

export const SyntaxHighlight: React.FC<{
    children: string | undefined;
    className?: string;
    language: LiteralUnion<keyof typeof ProgrammingLanguage>;
    contentStyle?: React.CSSProperties;
}> = (props) => {
    const customStyle: React.CSSProperties = {
        ...props.contentStyle,
        borderRadius: "0.75rem",
        paddingLeft: "1.5rem",
        paddingRight: "1.5rem",
        paddingTop: "1rem",
        paddingBottom: "1rem",
    };

    const appLanguageToSyntaxHighlighterLanguage = {
        JSTS: "typescript",
        PYTHON: "python",
        JAVA: "java",
        CSHARP: "csharp",
        DART: "dart",
        RUBY: "ruby",
        GO: "go",
        PHP: "php",
    } satisfies Record<keyof typeof ProgrammingLanguage, string>;

    const language =
        appLanguageToSyntaxHighlighterLanguage[
            props.language as keyof typeof appLanguageToSyntaxHighlighterLanguage
        ] ?? props.language;

    return (
        <div className={cn("text-sm", props.className)}>
            <ReactMarkdown
                components={{
                    code: ({ node, children, ...componentProps }) => (
                        // @ts-expect-error
                        <SyntaxHighlighter
                            {...componentProps}
                            style={atomDark}
                            customStyle={customStyle}
                            codeTagProps={{
                                className: "**:font-mono",
                                style: {
                                    whiteSpace: "break-spaces",
                                },
                            }}
                            language={language}>
                            {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                    ),
                }}>
                {"".concat("```\n", props.children ?? "", "\n```")}
            </ReactMarkdown>
        </div>
    );
};

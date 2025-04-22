import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import type { ProgrammingLanguage } from "src/core/enums/programming-language";

export const SyntaxHighlight: React.FC<{
    children: string | undefined;
    className?: string;
    language: keyof typeof ProgrammingLanguage;
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
    } satisfies Record<keyof typeof ProgrammingLanguage, string>;

    return (
        <div className={props.className}>
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
                            language={
                                appLanguageToSyntaxHighlighterLanguage[
                                    props.language
                                ]
                            }>
                            {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                    ),
                }}>
                {"".concat("```\n", props.children ?? "", "\n```")}
            </ReactMarkdown>
        </div>
    );
};

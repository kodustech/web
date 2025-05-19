import { Section } from "@components/ui/section";
import { SyntaxHighlight } from "@components/ui/syntax-highlight";
import { CheckIcon, XIcon } from "lucide-react";
import type { ProgrammingLanguage } from "src/core/enums/programming-language";
import { cn } from "src/core/utils/components";

export const ExampleSection = ({
    example,
    language,
}: {
    example: {
        isCorrect: boolean;
        snippet: string;
    };
    language: keyof typeof ProgrammingLanguage;
}) => (
    <Section.Root>
        <Section.Header className="gap-4">
            <div
                className={cn(
                    "children:size-4 flex size-6 items-center justify-center rounded-full",
                    !example.isCorrect ? "bg-danger/10" : "bg-success/10",
                )}>
                {!example.isCorrect ? (
                    <XIcon className="stroke-danger" />
                ) : (
                    <CheckIcon className="stroke-success" />
                )}
            </div>
            <div className="flex flex-1 flex-col gap-3">
                <div className="text-sm font-medium">
                    {!example.isCorrect ? "Bad" : "Good"}
                </div>
            </div>
        </Section.Header>
        <Section.Content className="text-text-secondary text-sm">
            <SyntaxHighlight language={language}>
                {example.snippet}
            </SyntaxHighlight>
        </Section.Content>
    </Section.Root>
);

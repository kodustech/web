import Image from "next/image";
import { Card } from "@components/ui/card";

import { GroupingModeSuggestions } from "./pages/types";

interface CodeGroupingExampleCardProps {
    groupingType: GroupingModeSuggestions;
}

export default function CodeGroupingExampleCard({
    groupingType,
}: CodeGroupingExampleCardProps) {
    if (groupingType === GroupingModeSuggestions.FULL) {
        return (
            <Card className="px-8 py-6">
                <span className="mb-4 text-justify text-sm">
                    Combine all occurrences of the same issue into a single
                    comment. This is ideal for reducing noise in large PRs. All
                    affected files and lines are listed together, but without
                    links to specific locations.
                </span>
                <Image
                    src="/assets/images/full_grouping.png"
                    alt="Full grouping"
                    width={509}
                    height={205}
                />
            </Card>
        );
    }

    return (
        <Card className="px-8 py-6">
            <span className="mb-4 text-justify text-sm">
                Every occurrence of the same issue gets its own comment. Best
                for detailed reviews or small PRs. Each comment provides precise
                context with direct links to the code.
            </span>

            <Image
                src="/assets/images/minimal_grouping.png"
                alt="File grouping"
                width={509}
                height={205}
            />
        </Card>
    );
}

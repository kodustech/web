"use client";

import { useState } from "react";
import { Button } from "@components/ui/button";
import { Card, CardHeader } from "@components/ui/card";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleIndicator,
    CollapsibleTrigger,
} from "@components/ui/collapsible";
import { Heading } from "@components/ui/heading";
import { Switch } from "@components/ui/switch";
import { useAsyncAction } from "@hooks/use-async-action";

export const SyncAndGenerateRules = () => {
    const [value1, setValue1] = useState(false);
    const [value2, setValue2] = useState(true);

    const [action1, { loading: loading1 }] = useAsyncAction(async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setValue1((prev) => !prev);
    });

    const [action2, { loading: loading2 }] = useAsyncAction(async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setValue2((prev) => !prev);
    });

    return (
        <Collapsible>
            <CollapsibleTrigger asChild>
                <Button
                    size="md"
                    variant="helper"
                    rightIcon={<CollapsibleIndicator />}
                    className="w-full justify-between">
                    Sync & Generate Rules
                </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-2">
                <Card color="lv1">
                    <CardHeader>
                        <Button
                            size="sm"
                            variant="helper"
                            className="w-full"
                            onClick={() => {
                                if (loading1) return;
                                action1();
                            }}>
                            <CardHeader className="flex flex-row items-center justify-between gap-6 px-4 py-3">
                                <div className="flex flex-col gap-1">
                                    <Heading variant="h3">
                                        Auto-sync rules from repo
                                    </Heading>

                                    <p className="text-text-secondary text-xs">
                                        When enabled, Kody will automatically
                                        import rule files
                                        <code className="bg-card-lv1 mx-1 rounded px-0.5 py-0.5">
                                            (.cursorrules, CLAUDE.md, etc.)
                                        </code>
                                        found in this repository and keep them
                                        in sync.
                                    </p>
                                </div>

                                <Switch
                                    decorative
                                    checked={value1}
                                    loading={loading1}
                                />
                            </CardHeader>
                        </Button>

                        <Button
                            size="sm"
                            variant="helper"
                            className="w-full"
                            onClick={() => {
                                if (loading2) return;
                                action2();
                            }}>
                            <CardHeader className="flex flex-row items-center justify-between gap-6 px-4 py-3">
                                <div className="flex flex-col gap-1">
                                    <Heading variant="h3">
                                        Generate from past reviews
                                    </Heading>

                                    <p className="text-text-secondary text-xs">
                                        Kody will analyze closed PRs and suggest
                                        rules automatically.
                                    </p>
                                </div>

                                <Switch
                                    decorative
                                    checked={value2}
                                    loading={loading2}
                                />
                            </CardHeader>
                        </Button>
                    </CardHeader>
                </Card>
            </CollapsibleContent>
        </Collapsible>
    );
};

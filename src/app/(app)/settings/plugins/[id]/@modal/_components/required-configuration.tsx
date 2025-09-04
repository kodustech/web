"use client";

import type { Dispatch, SetStateAction } from "react";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardHeader } from "@components/ui/card";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleIndicator,
    CollapsibleTrigger,
} from "@components/ui/collapsible";
import { FormControl } from "@components/ui/form-control";
import { Input } from "@components/ui/input";
import { Markdown } from "@components/ui/markdown";
import type { getMCPPluginById } from "@services/mcp-manager/fetch";
import { AlertTriangleIcon, CheckCircle2Icon } from "lucide-react";
import type { AwaitedReturnType } from "src/core/types";

export const RequiredConfiguration = ({
    plugin,
    values,
    setValues,
    isValid,
}: {
    plugin: AwaitedReturnType<typeof getMCPPluginById>;
    values: Record<string, string>;
    setValues: Dispatch<SetStateAction<Record<string, string>>>;
    isValid: boolean;
}) => {
    return (
        <Collapsible defaultOpen>
            <Card color="lv1">
                <CollapsibleTrigger asChild>
                    <Button
                        size="sm"
                        variant="cancel"
                        className="min-h-auto w-full py-0"
                        leftIcon={<CollapsibleIndicator />}>
                        <CardHeader className="flex-row justify-between px-0 py-4">
                            <span className="text-sm font-bold">
                                Required configuration
                            </span>

                            {isValid ? (
                                <CheckCircle2Icon className="text-success" />
                            ) : (
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="flex gap-1">
                                        <span className="font-bold">
                                            {
                                                Object.values(values).filter(
                                                    (v) => v.trim().length > 0,
                                                ).length
                                            }
                                        </span>
                                        <span>
                                            of {plugin.requiredParams.length}
                                        </span>
                                    </div>
                                    <AlertTriangleIcon className="text-alert" />
                                </div>
                            )}
                        </CardHeader>
                    </Button>
                </CollapsibleTrigger>

                <CollapsibleContent className="pb-0">
                    {plugin.requiredParams.length > 0 && (
                        <CardContent className="flex flex-col gap-4 pb-4">
                            {plugin.requiredParams.map((p) => (
                                <FormControl.Root key={p.name}>
                                    <FormControl.Label htmlFor={p.name}>
                                        {p.displayName}
                                    </FormControl.Label>

                                    <FormControl.Input>
                                        <Input
                                            size="md"
                                            id={p.name}
                                            placeholder="This information is required"
                                            value={values?.[p.name] ?? ""}
                                            onChange={(e) => {
                                                setValues((rpv) => ({
                                                    ...rpv,
                                                    [p.name]: e.target.value,
                                                }));
                                            }}
                                        />
                                    </FormControl.Input>

                                    <FormControl.Helper>
                                        <Markdown>{p.description}</Markdown>
                                    </FormControl.Helper>
                                </FormControl.Root>
                            ))}
                        </CardContent>
                    )}
                </CollapsibleContent>
            </Card>
        </Collapsible>
    );
};

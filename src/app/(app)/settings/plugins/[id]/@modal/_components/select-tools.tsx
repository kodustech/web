"use client";

// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import type { Dispatch, SetStateAction } from "react";
import { Button } from "@components/ui/button";
import { Card, CardHeader } from "@components/ui/card";
import { Checkbox } from "@components/ui/checkbox";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleIndicator,
    CollapsibleTrigger,
} from "@components/ui/collapsible";
import { Heading } from "@components/ui/heading";
import { ToggleGroup } from "@components/ui/toggle-group";
import type { getMCPPluginTools } from "@services/mcp-manager/fetch";
import { AlertTriangleIcon } from "lucide-react";

export const SelectTools = ({
    selectedTools,
    setSelectedTools,
    tools,
    defaultOpen,
}: {
    defaultOpen: boolean;
    selectedTools: Array<string>;
    setSelectedTools: Dispatch<SetStateAction<Array<string>>>;
    tools: Awaited<ReturnType<typeof getMCPPluginTools>>;
}) => {
    return (
        <Collapsible defaultOpen={defaultOpen}>
            <Card className="w-full" color="lv1">
                <CollapsibleTrigger asChild>
                    <Button
                        size="sm"
                        variant="cancel"
                        className="min-h-auto w-full py-0"
                        leftIcon={<CollapsibleIndicator />}>
                        <CardHeader className="flex-row justify-between px-0 py-4">
                            <span className="text-sm font-bold">
                                Selected tools
                            </span>

                            <div className="flex items-center gap-1 text-sm">
                                <span className="font-bold">
                                    {selectedTools.length}
                                </span>
                                <span>of {tools.length}</span>

                                {selectedTools.length === 0 && (
                                    <AlertTriangleIcon className="text-alert ml-2" />
                                )}
                            </div>
                        </CardHeader>
                    </Button>
                </CollapsibleTrigger>

                <CollapsibleContent className="pb-0">
                    <div className="max-h-96 overflow-auto px-3">
                        <ToggleGroup.Root
                            type="multiple"
                            value={selectedTools}
                            onValueChange={setSelectedTools}
                            className="columns-2 space-y-2 gap-x-2 pb-4">
                            {tools.map((tool) => (
                                <ToggleGroup.ToggleGroupItem
                                    asChild
                                    key={tool.slug}
                                    value={tool.slug}>
                                    <Button
                                        size="sm"
                                        variant="helper"
                                        className="w-full items-start justify-start gap-3 py-4 font-normal">
                                        <Checkbox
                                            decorative
                                            className="size-5"
                                            checked={selectedTools.includes(
                                                tool.slug,
                                            )}
                                        />

                                        <div className="flex flex-col">
                                            <Heading
                                                variant="h3"
                                                className="text-text-primary min-h-5">
                                                {tool.name}
                                            </Heading>

                                            <span className="text-xs">
                                                {tool.description}
                                            </span>
                                        </div>
                                    </Button>
                                </ToggleGroup.ToggleGroupItem>
                            ))}
                        </ToggleGroup.Root>
                    </div>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    );
};

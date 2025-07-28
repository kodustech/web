"use client";

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
import { toast } from "@components/ui/toaster/use-toast";
import { useAsyncAction } from "@hooks/use-async-action";
import { useReactQueryInvalidateQueries } from "@hooks/use-invalidate-queries";
import { PARAMETERS_PATHS } from "@services/parameters";
import { createOrUpdateCodeReviewParameter } from "@services/parameters/fetch";
import { ParametersConfigKey } from "@services/parameters/types";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";

import type { CodeReviewGlobalConfig } from "../../types";

export const SyncAndGenerateRules = ({
    config,
}: {
    repositoryId: string;
    config: CodeReviewGlobalConfig & { id?: string };
}) => {
    const { teamId } = useSelectedTeamId();

    const { invalidateQueries, generateQueryKey } =
        useReactQueryInvalidateQueries();

    const [handleKodyRulesGeneratorToggle, { loading: isLoadingToggle }] =
        useAsyncAction(async () => {
            try {
                await createOrUpdateCodeReviewParameter(
                    {
                        ...config,
                        kodyRulesGeneratorEnabled:
                            !config.kodyRulesGeneratorEnabled,
                    },
                    teamId,
                    config?.id,
                );

                await invalidateQueries({
                    type: "all",
                    queryKey: generateQueryKey(PARAMETERS_PATHS.GET_BY_KEY, {
                        params: {
                            key: ParametersConfigKey.CODE_REVIEW_CONFIG,
                            teamId,
                        },
                    }),
                });

                toast({
                    variant: "success",
                    title: "Settings saved",
                    description: `Auto-sync rules from repo has been ${
                        config.kodyRulesGeneratorEnabled
                            ? "disabled"
                            : "enabled"
                    }`,
                });
            } catch (error) {
                console.error("Erro ao salvar as configurações:", error);

                toast({
                    title: "Error",
                    description:
                        "An error occurred while saving the settings. Please try again.",
                    variant: "danger",
                });
            }
        });

    return (
        <Collapsible>
            <CollapsibleTrigger asChild>
                <Button
                    size="lg"
                    variant="helper"
                    rightIcon={<CollapsibleIndicator />}
                    className="w-full justify-between">
                    Sync & Generate Rules
                </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-2 pb-0">
                <Card color="lv1">
                    <CardHeader>
                        <Button
                            size="sm"
                            variant="helper"
                            className="w-full"
                            onClick={() => handleKodyRulesGeneratorToggle()}>
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
                                    loading={isLoadingToggle}
                                    checked={config.kodyRulesGeneratorEnabled}
                                />
                            </CardHeader>
                        </Button>

                        {/* <Button
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
                        </Button> */}
                    </CardHeader>
                </Card>
            </CollapsibleContent>
        </Collapsible>
    );
};

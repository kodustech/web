"use client";

import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@components/ui/hover-card";
import { Spinner } from "@components/ui/spinner";
import { Switch } from "@components/ui/switch";
import { toast } from "@components/ui/toaster/use-toast";
import { useAsyncAction } from "@hooks/use-async-action";
import { useReactQueryInvalidateQueries } from "@hooks/use-invalidate-queries";
import { generateKodyRules } from "@services/kodyRules/fetch";
import { PARAMETERS_PATHS } from "@services/parameters";
import { createOrUpdateCodeReviewParameter } from "@services/parameters/fetch";
import {
    KodyLearningStatus,
    ParametersConfigKey,
} from "@services/parameters/types";

import { usePlatformConfig } from "../../../context";
import { CodeReviewGlobalConfig } from "../../types";

export const GenerateRulesButton = ({
    teamId,
    config,
}: {
    teamId: string;
    repositoryId: string;
    config: CodeReviewGlobalConfig & { id?: string };
}) => {
    const platformConfig = usePlatformConfig();

    const { invalidateQueries, generateQueryKey } =
        useReactQueryInvalidateQueries();

    const [generateRules, isLoadingButton] = useAsyncAction(async () => {
        generateKodyRules(teamId);

        await new Promise((resolve) => setTimeout(resolve, 2000));

        await invalidateQueries({
            type: "all",
            queryKey: generateQueryKey(PARAMETERS_PATHS.GET_BY_KEY, {
                params: {
                    teamId,
                    key: ParametersConfigKey.PLATFORM_CONFIGS,
                },
            }),
        });
    });

    // if more settings are added to this page consider switching to using a form
    const [handleKodyRulesGeneratorToggle, isLoadingToggle] = useAsyncAction(
        async () => {
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
                    title: "Success",
                    description:
                        "Code review automation settings saved successfully.",
                    variant: "default",
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
        },
    );

    switch (platformConfig.kodyLearningStatus) {
        case KodyLearningStatus.ENABLED:
            return (
                <HoverCard>
                    <HoverCardTrigger>
                        <Card className="flex w-full flex-row items-center gap-4 p-3">
                            Auto-Generate
                            <Switch
                                decorative
                                disabled={isLoadingToggle.loading!}
                                onClick={handleKodyRulesGeneratorToggle}
                                checked={config.kodyRulesGeneratorEnabled}
                            />
                        </Card>
                    </HoverCardTrigger>
                    <HoverCardContent className="rounded-2xl">
                        <p className="text-text-secondary text-sm">
                            Kody learns continuously and generates every week.
                        </p>
                    </HoverCardContent>
                </HoverCard>
            );

        case KodyLearningStatus.GENERATING_RULES:
            return (
                <Button
                    size="md"
                    decorative
                    variant="primary-dark"
                    leftIcon={<Spinner />}>
                    Generating Kody Rules...
                </Button>
            );

        case KodyLearningStatus.DISABLED:
        default:
            return (
                <Button
                    size="md"
                    variant="primary-dark"
                    onClick={generateRules}
                    disabled={isLoadingButton.loading}>
                    Generate Kody Rules
                </Button>
            );
    }
};

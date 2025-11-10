"use client";

import { Suspense, useEffect } from "react";
import { useParams } from "next/navigation";
import { GetStartedChecklist } from "@components/system/get-started-checklist";
import { Button } from "@components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@components/ui/sheet";
import { useSuspenseGetParameterByKey } from "@services/parameters/hooks";
import { LanguageValue, ParametersConfigKey } from "@services/parameters/types";
import { usePermission } from "@services/permissions/hooks";
import { Action, ResourceType } from "@services/permissions/types";
import { Eye } from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";
import { cn } from "src/core/utils/components";

import { DryRunSidebar } from "../_components/dry-run-sidebar";
import { type CodeReviewFormType } from "../_types";
import { useCodeReviewConfig } from "../../_components/context";

export default function Layout(props: React.PropsWithChildren) {
    const { teamId } = useSelectedTeamId();
    const config = useCodeReviewConfig();
    const parameters = useSuspenseGetParameterByKey<LanguageValue>(
        ParametersConfigKey.LANGUAGE_CONFIG,
        teamId,
        {
            fallbackData: {
                uuid: "",
                configKey: "",
                configValue: LanguageValue.ENGLISH,
            },
        },
    );

    const params = useParams();
    const repositoryId = params.repositoryId as string;

    const canEdit = usePermission(
        Action.Update,
        ResourceType.CodeReviewSettings,
        repositoryId,
    );

    const canManage = usePermission(
        Action.Manage,
        ResourceType.CodeReviewSettings,
    );

    const form = useForm<CodeReviewFormType>({
        mode: "all",
        criteriaMode: "firstError",
        reValidateMode: "onChange",
        defaultValues: {
            ...config,
            language: parameters.configValue,
        },
        disabled: !canEdit,
    });

    useEffect(() => {
        form.reset({ ...config, language: parameters.configValue });
    }, [config?.id]);

    // const getStarted = GetStartedChecklist();
    const getStartedVisible = true;

    return (
        <FormProvider {...form}>
            {props.children}

            {canManage && (
                <Sheet>
                    <Suspense>
                        <SheetTrigger asChild>
                            <Button
                                size="lg"
                                variant="primary"
                                className={cn(
                                    "fixed right-5 z-50",
                                    getStartedVisible
                                        ? "bottom-25"
                                        : "bottom-5",
                                )}>
                                <Eye />
                                Preview
                            </Button>
                        </SheetTrigger>

                        <DryRunSidebar />
                    </Suspense>
                </Sheet>
            )}
        </FormProvider>
    );
}

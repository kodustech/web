"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useSuspenseGetParameterByKey } from "@services/parameters/hooks";
import { LanguageValue, ParametersConfigKey } from "@services/parameters/types";
import { usePermission } from "@services/permissions/hooks";
import { Action, ResourceType } from "@services/permissions/types";
import { FormProvider, useForm } from "react-hook-form";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";

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

    const canEdit = usePermission(
        Action.Update,
        ResourceType.CodeReviewSettings,
        params.repositoryId as string,
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

    return <FormProvider {...form}>{props.children}</FormProvider>;
}

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@components/ui/breadcrumb";
import { applySearchParamsToUrl } from "src/core/utils/url";

import { useCodeReviewRouteParams } from "../_hooks";
import { useAutomationCodeReviewConfig } from "./context";

export const CodeReviewPagesBreadcrumb = (props: { pageName: string }) => {
    const { repositoryId, directoryId } = useCodeReviewRouteParams();
    const config = useAutomationCodeReviewConfig();

    const url = applySearchParamsToUrl(
        `/settings/code-review/${repositoryId}/general`,
        { directoryId },
    );

    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href={url}>
                        {config?.displayName}
                    </BreadcrumbLink>
                </BreadcrumbItem>

                <BreadcrumbSeparator />

                <BreadcrumbItem>
                    <BreadcrumbPage>{props.pageName}</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    );
};

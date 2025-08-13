import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@components/ui/breadcrumb";
import { addSearchParamsToUrl } from "src/core/utils/url";

import { useCodeReviewConfig } from "../../_components/context";
import { useCodeReviewRouteParams } from "../../_hooks";

export const CodeReviewPagesBreadcrumb = (props: { pageName: string }) => {
    const { repositoryId, directoryId } = useCodeReviewRouteParams();
    const config = useCodeReviewConfig();

    const url = addSearchParamsToUrl(
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

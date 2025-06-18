import { typedFetch } from "@services/fetch";
import { getOrganizationId } from "@services/organizations/fetch";
import type { IssuesListContext } from "src/app/(app)/issues/_contexts/issues-list";
import type { SeverityLevel } from "src/core/types";
import { axiosAuthorized } from "src/core/utils/axios";
import { pathToApiUrl } from "src/core/utils/helpers";

export const getIssuesCount = () =>
    typedFetch<number>(pathToApiUrl("/issues/count"));

export const getIssues = async () =>
    typedFetch<React.ContextType<typeof IssuesListContext>>(
        pathToApiUrl("/issues"),
        { params: { organizationId: await getOrganizationId() } },
    );

export const changeIssueParameter = async ({
    id,
    field,
    value,
}: { id: string } & (
    | {
          field: "label";
          value: "security";
      }
    | {
          field: "severity";
          value: SeverityLevel;
      }
    | {
          field: "status";
          value: "open" | "closed";
      }
)) => {
    return axiosAuthorized.patch(pathToApiUrl(`/issues/${id}`), {
        field,
        value,
    });
};

export const getIssue = async (params: { id: string }) => {
    return typedFetch<{
        title: string;
        description: string;
        age: string;
        label: "potential_issues";
        severity: SeverityLevel;
        status: "open" | "closed";
        fileLink: { label: string; url: string };
        prLinks: [{ label: string; url: string }];
        repositoryLink: { label: string; url: string };
        currentCode: string;
        reactions: { thumbsUp: number; thumbsDown: number };
        gitOrganizationName: string;
        startLine: number;
        endLine: number;
        language: string;
    }>(pathToApiUrl(`/issues/${params.id}`));
};

import type { SeverityLevel } from "src/core/types";
import { axiosAuthorized } from "src/core/utils/axios";
import { pathToApiUrl } from "src/core/utils/helpers";

import type { IssueStatus } from "./types";

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
          value: IssueStatus;
      }
)) => {
    return axiosAuthorized.patch(pathToApiUrl(`/issues/${id}`), {
        field,
        value,
    });
};

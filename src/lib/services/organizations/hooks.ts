import { useUpdate } from "src/core/utils/reactQuery";

import { ORGANIZATIONS_PATHS } from ".";

export function useUpdateOrganizationInfos() {
    return useUpdate<
        never,
        {
            name: string;
            phone?: string;
        }
    >(ORGANIZATIONS_PATHS.UPDATE_INFOS);
}

import { authorizedFetch } from "@services/fetch";
import { axiosAuthorized } from "src/core/utils/axios";
import {
    SSOConfig,
    SSOProtocol,
    SSOProtocolConfigMap,
} from "src/lib/auth/types";

import { SSO_CONFIG_PATHS } from "./index";

export const getSSOConfig = async <T extends SSOProtocol>(params: {
    active?: boolean;
    protocol?: T;
}): Promise<SSOConfig<T>> => {
    const response = await authorizedFetch<SSOConfig<T>>(SSO_CONFIG_PATHS.GET, {
        params,
    });

    return response;
};

export const createOrUpdateSSOConfig = async <T extends SSOProtocol>(params: {
    uuid?: string;
    protocol: T;
    providerConfig: SSOProtocolConfigMap[T];
    active?: boolean;
    domains?: string[];
}): Promise<SSOConfig<T>> => {
    const response = await axiosAuthorized.post<SSOConfig<T>>(
        SSO_CONFIG_PATHS.CREATE_OR_UPDATE,
        {
            uuid: params.uuid,
            protocol: params.protocol,
            providerConfig: params.providerConfig,
            active: params.active,
            domains: params.domains,
        },
    );

    return response;
};

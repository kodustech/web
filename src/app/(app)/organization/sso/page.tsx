import { getSSOConfig } from "@services/ssoConfig/fetch";
import { auth } from "src/core/config/auth";
import { SSOConfig, SSOProtocol } from "src/lib/auth/types";

import { ClientSsoOrganizationSettingsPage } from "./_page-component";

export default async function SsoOrganizationSettingsPage() {
    const jwtPayload = await auth();
    const email = jwtPayload?.user.email ?? "";

    let ssoConfig: SSOConfig<SSOProtocol.SAML> = {
        protocol: SSOProtocol.SAML,
        active: false,
        providerConfig: {
            idpIssuer: "",
            issuer: "",
            entryPoint: "",
            cert: "",
        },
        domains: [],
    };

    try {
        const result = await getSSOConfig({
            protocol: SSOProtocol.SAML,
        });

        if (result) {
            ssoConfig = {
                protocol: result.protocol,
                active: result.active,
                providerConfig: result.providerConfig,
                uuid: result.uuid,
                domains: result.domains,
            };
        }
    } catch (error: unknown) {
        console.error(error);
    }

    return (
        <ClientSsoOrganizationSettingsPage
            email={email}
            ssoConfig={ssoConfig}
            uuid={ssoConfig.uuid}
        />
    );
}

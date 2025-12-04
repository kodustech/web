export enum AuthProviders {
    CREDENTIALS = "credentials",
    GOOGLE = "google",
    GITHUB = "github",
    GITLAB = "gitlab",
    SSO = "sso",
}

export enum SSOProtocol {
    SAML = "saml",
    OIDC = "oidc",
}

export interface SSOConfig<P extends SSOProtocol> {
    uuid?: string;
    protocol: P;
    active: boolean;
    providerConfig: SSOProtocolConfigMap[P];
    domains: string[];
    createdAt?: string;
    updatedAt?: string;
}

export type SSOProtocolConfigMap = {
    [SSOProtocol.SAML]: SAMLConfig;
    [SSOProtocol.OIDC]: OIDCConfig;
};

export interface SAMLConfig {
    entryPoint: string;
    idpIssuer: string;
    issuer?: string;
    cert: string;
    identifierFormat?: string;
}

export interface OIDCConfig {
    issuerUrl: string;
    clientId: string;
    clientSecret: string;
    authorizationUrl: string;
    tokenUrl: string;
    userInfoUrl: string;
    scope?: string;
}

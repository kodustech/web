export type OrganizationLicenseInvalid = {
    valid: false;
    subscriptionStatus: "payment_failed" | "canceled" | "expired" | "inactive";
    numberOfLicenses: number;
};

export type OrganizationLicenseTrial = {
    valid: true;
    subscriptionStatus: "trial";
    trialEnd: string;
};

export type PlanType =
    | "free_byok"
    | "teams_byok"
    | "teams_byok_annual"
    | "teams_managed"
    | "teams_managed_annual"
    | "teams_managed_legacy"
    | "enterprise_byok"
    | "enterprise_byok_annual"
    | "enterprise_managed"
    | "enterprise_managed_annual";

export type OrganizationLicenseActive = {
    valid: true;
    subscriptionStatus: "active";
    numberOfLicenses: number;
    planType: PlanType;
};

export type OrganizationLicenseSelfHosted = {
    valid: true;
    subscriptionStatus: "self-hosted";
};

export type OrganizationLicense =
    | OrganizationLicenseInvalid
    | OrganizationLicenseTrial
    | OrganizationLicenseActive
    | OrganizationLicenseSelfHosted;
